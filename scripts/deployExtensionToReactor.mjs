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

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(dirname, "..");
const extensionDir = path.join(rootDir, "packages", "reactor-extension");

const REACTOR_CLIENT_ID = "f401a5fe22184c91a85fd441a8aa2976";
const UPLOADER_SPEC = "@adobe/reactor-uploader@6.0.0-beta.12";
const RELEASER_SPEC = "@adobe/reactor-releaser@4.0.0-beta.8";

const run = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: opts.cwd || rootDir,
    env: { ...process.env, ...opts.env },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const version = process.env.EXTENSION_VERSION || process.argv[2];
if (!version) {
  console.error(
    "Usage: EXTENSION_VERSION=x.y.z node scripts/deployExtensionToReactor.mjs [x.y.z]",
  );
  process.exit(1);
}

const zipName = `package-adobe-alloy-${version}.zip`;
const zipPath = path.join(extensionDir, zipName);

run("pnpm", ["--filter", "reactor-extension", "run", "package"], {
  cwd: rootDir,
});

if (!fs.existsSync(zipPath)) {
  console.error(`Expected zip at ${zipPath}`);
  process.exit(1);
}

run(
  "pnpx",
  [
    UPLOADER_SPEC,
    zipPath,
    "--auth.client-id=" + REACTOR_CLIENT_ID,
    "--upload-timeout=300",
  ],
  {
    cwd: rootDir,
    env: {
      REACTOR_IO_INTEGRATION_CLIENT_SECRET:
        process.env.REACTOR_IO_INTEGRATION_CLIENT_SECRET,
    },
  },
);

const releaser = spawnSync(
  "pnpx",
  [RELEASER_SPEC, "--auth.client-id=" + REACTOR_CLIENT_ID],
  {
    cwd: rootDir,
    input: "Y\n",
    stdio: ["pipe", "inherit", "inherit"],
    env: {
      ...process.env,
      REACTOR_IO_INTEGRATION_CLIENT_SECRET:
        process.env.REACTOR_IO_INTEGRATION_CLIENT_SECRET,
    },
  },
);
if (releaser.status !== 0) process.exit(releaser.status ?? 1);
