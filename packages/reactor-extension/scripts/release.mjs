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
// latest version: <that same version>". The message is JSON-stringified
// twice on its way to the console, so backslash-escaped quotes are
// collapsed before matching. The "invalid-version" code is required
// alongside the equal-version detail so an unrelated error that happens to
// contain similar wording can't be mistaken for this specific case.
export const isAlreadyReleasedError = (output) => {
  const normalized = output.replace(/\\"/g, '"');
  if (!/"code":\s*"invalid-version"/.test(normalized)) {
    return false;
  }
  const match = normalized.match(
    /"detail":"([^"]+) is older than latest version: ([^"]+)"/,
  );
  return Boolean(match) && match[1] === match[2];
};

const invokedAsCli =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

const main = () => {
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
    {
      cwd: pkgDir,
      env: process.env,
      encoding: "utf8",
      // Buffered rather than "inherit" so the output can be inspected below;
      // sized well above spawnSync's default so verbose uploader output
      // can't get silently truncated before the check runs.
      maxBuffer: 10 * 1024 * 1024,
    },
  );
  process.stdout.write(upload.stdout ?? "");
  process.stderr.write(upload.stderr ?? "");

  // Checked before inspecting output for the already-released case: a spawn
  // failure or signal kill must never be mistaken for a successful skip just
  // because matching text happens to appear in whatever output was captured.
  if (upload.error) {
    console.error(
      `Failed to spawn "reactor-uploader": ${upload.error.message}`,
    );
    process.exitCode = 1;
    return;
  }
  if (upload.signal) {
    console.error(`"reactor-uploader" killed by signal ${upload.signal}`);
    process.exitCode = 1;
    return;
  }
  if (upload.status !== 0) {
    const output = `${upload.stdout ?? ""}${upload.stderr ?? ""}`;
    if (isAlreadyReleasedError(output)) {
      console.log(
        `${name}@${version} is already released on Reactor; skipping.`,
      );
      return;
    }
    process.exitCode = upload.status ?? 1;
    return;
  }

  console.log(`Releasing ${name}@${version}...`);
  run("pnpm", [
    "exec",
    "reactor-releaser",
    `--auth.client-id=${REACTOR_CLIENT_ID}`,
    "--confirm-package-release",
  ]);
};

if (invokedAsCli) {
  main();
}
