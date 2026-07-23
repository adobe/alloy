#!/usr/bin/env node

/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import fs from "fs";

const REACTOR_CLIENT_ID = "f401a5fe22184c91a85fd441a8aa2976";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");

const run = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: opts.cwd || pkgDir,
    env: { ...process.env, ...opts.env },
  });
  if (result.error) {
    console.error(`Failed to spawn "${cmd}": ${result.error.message}`);
    process.exit(1);
  }
  if (result.signal) {
    console.error(`"${cmd}" killed by signal ${result.signal}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

// Reactor keeps a single "development" extension package per name+platform
// and drops its dev-availability record once released. Re-running this
// script for a version that was already fully released can't find a dev
// record to PATCH, so it POSTs a new one instead; Reactor rejects that as
// "invalid-version", reporting the attempted version as older than "the
// latest version: <that same version>". The message gets JSON-stringified
// twice on its way to the console, so quotes may or may not be
// backslash-escaped depending on nesting depth. Recognize this exact
// already-released shape (both sides of the comparison equal) rather than
// treating it as a real failure.
export const isAlreadyReleasedError = (output) => {
  const match = output.match(
    /detail\\?"\s*:\s*\\?"([^"\\]+) is older than latest version: ([^"\\]+)/,
  );
  return Boolean(match) && match[1] === match[2];
};

const invokedAsCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedAsCli) {
  const { name, version } = JSON.parse(
    fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
  );

  // Build + zip the extension. The `package` script writes
  // package-adobe-alloy-<version>.zip into the package dir.
  console.log(`Building ${name}@${version} extension package...`);
  run("pnpm", ["run", "package"]);

  const zipName = `package-adobe-alloy-${version}.zip`;
  const zipPath = path.join(pkgDir, zipName);
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Expected packaged zip at ${zipPath}`);
  }

  console.log(`Uploading ${zipName} to Reactor...`);
  const upload = spawnSync(
    "pnpm",
    [
      "exec",
      "reactor-uploader",
      zipPath,
      `--auth.client-id=${REACTOR_CLIENT_ID}`,
      "--upload-timeout=300",
    ],
    { cwd: pkgDir, env: process.env, encoding: "utf8" },
  );
  process.stdout.write(upload.stdout ?? "");
  process.stderr.write(upload.stderr ?? "");
  if (upload.status !== 0) {
    const output = `${upload.stdout ?? ""}${upload.stderr ?? ""}`;
    if (isAlreadyReleasedError(output)) {
      console.log(
        `${name}@${version} is already released on Reactor; skipping.`,
      );
      process.exit(0);
    }
    process.exit(upload.status ?? 1);
  }

  console.log(`Releasing ${name}@${version}...`);
  run("pnpm", [
    "exec",
    "reactor-releaser",
    `--auth.client-id=${REACTOR_CLIENT_ID}`,
    "--confirm-package-release",
  ]);
}
