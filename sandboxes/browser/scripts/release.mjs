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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const buildDir = path.join(pkgDir, "build");
const { name, version } = JSON.parse(
  fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
);

const token = process.env.AZURE_STATIC_WEB_APPS_API_TOKEN;
if (!token) {
  throw new Error(
    "AZURE_STATIC_WEB_APPS_API_TOKEN must be set to deploy the sandbox.",
  );
}

const run = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, {
    stdio: "inherit",
    cwd: opts.cwd || pkgDir,
    env: { ...process.env, ...opts.env },
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
};

console.log(`Building ${name}@${version}...`);
run("pnpm", ["run", "build"]);

if (!fs.existsSync(buildDir)) {
  throw new Error(`Expected build output at ${buildDir}`);
}

// Re-deploying the same content is idempotent at Azure Static Web Apps:
// the deployment overwrites the existing app at this environment.
console.log(`Deploying ${name}@${version} to alloyio.com...`);
run("pnpx", [
  "@azure/static-web-apps-cli",
  "deploy",
  buildDir,
  "--api-key",
  token,
  "--env",
  "Production",
]);
