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
import { setTimeout as sleep } from "node:timers/promises";
import { fileURLToPath } from "url";
import { isPrerelease, cdnUrlFor } from "./helpers/release.js";
import pkg from "../package.json" with { type: "json" };
const { name, version } = pkg;

const urlExists = async (url) => {
  const startedAt = Date.now();
  try {
    const res = await fetch(url, { method: "HEAD" });
    if (res.ok) {
      return true;
    }
    console.error(
      `CDN verification: HEAD ${url} — request failed with status ${res.status} ${res.statusText}`,
    );
    return false;
  } catch (error) {
    console.warn(
      `CDN verification: HEAD ${url} — request failed (${Date.now() - startedAt}ms)`,
      error,
    );
    return false;
  }
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const distDir = path.join(pkgDir, "dist");

const FILES_TO_UPLOAD = [
  "alloy.js",
  "alloy.min.js",
  "alloyServiceWorker.js",
  "alloyServiceWorker.min.js",
];

const uploadStatuses = await Promise.all(
  FILES_TO_UPLOAD.map((file) => urlExists(cdnUrlFor(version, file))),
);
const alreadyUploaded = uploadStatuses.every(Boolean);

if (alreadyUploaded) {
  console.log(`CDN already has ${name}@${version}; skipping upload.`);
} else {
  console.log(`Building ${name}@${version} for CDN upload...`);
  execSync("pnpm run build", { cwd: pkgDir, stdio: "inherit" });

  for (const file of FILES_TO_UPLOAD) {
    const filePath = path.join(distDir, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing build artifact for CDN upload: ${filePath}`);
    }
  }

  // sftp batch: create versioned dir, cd into it, put each artifact, bye.
  const ftpCommands = [
    `-mkdir ${version}`,
    `cd ${version}`,
    ...FILES_TO_UPLOAD.map((f) => `put ${path.join(distDir, f)}`),
    "bye",
  ].join("\n");

  console.log(`Uploading ${name}@${version} to CDN...`);
  execSync(
    "sftp -oStrictHostKeyChecking=no -b - sshacs@dxresources.ssh.upload.akamai.com:/prod/alloy",
    { input: ftpCommands, stdio: ["pipe", "inherit", "inherit"] },
  );

  function* getRetryDelay() {
    const getRandom = (min, max) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    yield 1000 + getRandom(-500, 500);
    yield 1000 + getRandom(-500, 500);
    yield 2000 + getRandom(-500, 500);
    yield 3000 + getRandom(-500, 500);
    yield 5000 + getRandom(-500, 500);
  }
  const verifyFile = async (file) => {
    const url = cdnUrlFor(version, file);
    let exists = await urlExists(url);
    for (const delay of getRetryDelay()) {
      if (exists) {
        break;
      }
      console.log(`Retrying CDN verification for ${url} in ${delay}ms...`);
      await sleep(delay);
      exists = await urlExists(url);
    }
    return { file, exists };
  };

  // Verify each artifact landed before reporting success.
  const verifyResults = await Promise.allSettled(
    FILES_TO_UPLOAD.map(verifyFile),
  );
  const missing = verifyResults.flatMap((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `CDN verification failed for ${FILES_TO_UPLOAD[index]}:`,
        result.reason,
      );
      return [FILES_TO_UPLOAD[index]];
    }
    return result.value.exists ? [] : [result.value.file];
  });
  if (missing.length > 0) {
    throw new Error(`CDN verification failed for: ${missing.join(", ")}`);
  }
  console.log("CDN upload verified.");
}

if (isPrerelease(version)) {
  console.log(`Aliasing ${name}@${version} under npm dist-tag 'next'...`);
  execSync(`npm dist-tag add ${name}@${version} next`, { stdio: "inherit" });
}
