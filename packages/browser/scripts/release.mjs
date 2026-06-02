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
/**
 * 1. Upload build artifacts to CDN
 * 2. Verify that they were uploaded correctly
 * 3. If the version was a prerelease, tag it as `next` on npm.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { isPrerelease, cdnUrlFor } from "./helpers/release.js";
import { name, version } from "../package.json" with { type: "json" };

const urlExists = async (url) => {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const distDir = path.join(pkgDir, "dist");

const REQUIRED_ARTIFACTS = [
  "alloy.js",
  "alloy.min.js",
  "alloyServiceWorker.js",
  "alloyServiceWorker.min.js",
];

const alreadyUploaded = await urlExists(cdnUrlFor(version, "alloy.min.js"));

if (alreadyUploaded) {
  console.log(`CDN already has ${name}@${version}; skipping upload.`);
} else {
  for (const file of REQUIRED_ARTIFACTS) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing build artifact for CDN upload: ${filePath}`);
    }
  }

  // sftp batch: create versioned dir, cd into it, put each artifact, bye.
  const ftpCommands = [
    `-mkdir ${version}`,
    `cd ${version}`,
    ...REQUIRED_ARTIFACTS.map((f) => `put ${path.join(distDir, f)}`),
    "bye",
  ].join("\n");

  console.log(`Uploading ${name}@${version} to CDN...`);
  execSync(
    `echo "${ftpCommands}" | sftp -oStrictHostKeyChecking=no -b - sshacs@dxresources.ssh.upload.akamai.com:/prod/alloy`,
    { stdio: "inherit" },
  );

  // Verify each artifact landed before reporting success.
  const verifyResults = await Promise.all(
    REQUIRED_ARTIFACTS.map(async (file) => ({
      file,
      exists: await urlExists(cdnUrlFor(version, file)),
    })),
  );
  const missing = verifyResults.filter((r) => !r.exists).map((r) => r.file);
  if (missing.length > 0) {
    throw new Error(`CDN verification failed for: ${missing.join(", ")}`);
  }
  console.log("CDN upload verified.");
}

if (isPrerelease(version)) {
  console.log(`Aliasing ${name}@${version} under npm dist-tag 'next'...`);
  execSync(`npm dist-tag add ${name}@${version} next`, { stdio: "inherit" });
}
