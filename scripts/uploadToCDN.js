#!/usr/bin/env node

/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import urlExists from "url-exists-nodejs";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const projectRoot = path.resolve(dirname, "..");
const distDir = path.join(projectRoot, "dist");

const { version } = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"),
);

if (!version) {
  throw new Error("Unable to read package version for CDN upload.");
}

const requiredFiles = [
  "alloy.js",
  "alloy.min.js",
  "alloyServiceWorker.js",
  "alloyServiceWorker.min.js",
];

requiredFiles.forEach((file) => {
  const filePath = path.join(distDir, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing build artifact for CDN upload: ${filePath}`);
  }
});

const ftpCommands = `-mkdir ${version}
cd ${version}
put ${path.join(distDir, "alloy.js")}
put ${path.join(distDir, "alloy.min.js")}
put ${path.join(distDir, "alloyServiceWorker.js")}
put ${path.join(distDir, "alloyServiceWorker.min.js")}
bye
`;

console.log(`Uploading browser artifacts for version ${version} to CDN...`);
execSync(
  `echo "${ftpCommands}" | sftp -oHostKeyAlgorithms=+ssh-dss -oStrictHostKeyChecking=no -b - sshacs@dxresources.ssh.upload.akamai.com:/prod/alloy`,
  { stdio: "inherit" },
);
console.log("CDN upload complete.");

const cdnBase = `https://cdn1.adoberesources.net/alloy/${version}`;
const verifyUrls = [`${cdnBase}/alloy.js`, `${cdnBase}/alloy.min.js`];

/**
 * @param {string[]} urls
 * @returns {Promise<{ url: string, exists: boolean }[]>}
 */
const verifyCdnEndpoints = async (urls) => {
  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const exists = await urlExists(url);
      return { url, exists };
    }),
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    }
    // If the promise was rejected, return exists: false
    return { url: urls[index], exists: false };
  });
};
console.log("Verifying CDN endpoints...");
const results = await verifyCdnEndpoints(verifyUrls);
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.exists)) {
  throw new Error(
    "CDN endpoint verification failed for urls: " +
      results
        .filter((result) => !result.exists)
        .map((result) => result.url)
        .join(", "),
  );
}
console.log("CDN endpoint verification complete.");
