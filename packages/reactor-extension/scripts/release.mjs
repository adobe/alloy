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
import { fileURLToPath } from "url";
import fs from "fs";

const REACTOR_CLIENT_ID = "f401a5fe22184c91a85fd441a8aa2976";
const UPLOADER_SPEC = "@adobe/reactor-uploader@6.0.0-beta.12";
const RELEASER_SPEC = "@adobe/reactor-releaser@4.0.0-beta.8";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const { name, version } = JSON.parse(
  fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
);

const run = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: opts.cwd || pkgDir,
    env: { ...process.env, ...opts.env },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

// Build + zip the extension. The `package` script writes
// package-adobe-alloy-<version>.zip into the package dir.
console.log(`Building ${name}@${version} extension package...`);
run("pnpm", ["run", "package"]);

const zipName = `package-adobe-alloy-${version}.zip`;
const zipPath = path.join(pkgDir, zipName);
if (!fs.existsSync(zipPath)) {
  throw new Error(`Expected packaged zip at ${zipPath}`);
}

// Re-uploading the same version is idempotent: the uploader updates the
// existing development extension package by name.
console.log(`Uploading ${zipName} to Reactor...`);
run("pnpx", [
  UPLOADER_SPEC,
  zipPath,
  `--auth.client-id=${REACTOR_CLIENT_ID}`,
  "--upload-timeout=300",
]);

console.log(`Releasing ${name}@${version}...`);
const releaser = spawnSync(
  "pnpx",
  [RELEASER_SPEC, `--auth.client-id=${REACTOR_CLIENT_ID}`],
  {
    cwd: pkgDir,
    input: "Y\n",
    stdio: ["pipe", "inherit", "inherit"],
    env: process.env,
  },
);
if (releaser.status !== 0) process.exit(releaser.status ?? 1);
