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
import { setTimeout } from "timers/promises";
import { stripVTControlCharacters } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgDir = path.resolve(__dirname, "..");
const buildDir = path.join(pkgDir, "build");
const metadataFailure =
  "Deployment Failure Reason: Could not load StaticSitesClient metadata from remote. Please check your internet connection.";

const isRetryable = (output) => {
  const normalized = stripVTControlCharacters(output);
  if (
    /Preparing deployment|Deployment failed with exit code|unauthorized|forbidden|\b(?:401|403)\b|deployment token.*(?:invalid|expired)|SyntaxError|Checksum mismatch|Unsupported platform/i.test(
      normalized,
    ) ||
    /Response\.status = 4(?!08|29)\d{2}\b/.test(normalized)
  ) {
    return false;
  }
  // SWA 2.0.9 hides metadata HTTP/parse details at normal verbosity, so this
  // pre-deployment error receives bounded best-effort retries regardless of cause.
  if (normalized.includes(metadataFailure)) {
    return true;
  }
  if (
    /Deployment Failure Reason: Failed to download StaticSitesClient binary from url \S+\. File not found \((408|429|500|502|503|504)\)/.test(
      normalized,
    )
  ) {
    return true;
  }
  const transportFailure = normalized.match(
    /Deployment Failure Reason: request to (https:\/\/\S+) failed, reason: ([^\n]+)/,
  );
  return Boolean(
    transportFailure &&
    normalized.includes(`Downloading ${transportFailure[1]}@`) &&
    /ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up/.test(transportFailure[2]),
  );
};

const run = (cmd, args, token, capture = false) => {
  const redact = (output) => (output ?? "").split(token).join("<hidden>");
  const r = spawnSync(cmd, args, {
    stdio: capture ? "pipe" : "inherit",
    cwd: pkgDir,
    env: process.env,
    ...(capture && { encoding: "utf8", maxBuffer: 10 * 1024 * 1024 }),
  });
  if (capture) {
    process.stdout.write(redact(r.stdout));
    process.stderr.write(redact(r.stderr));
  }
  if (r.error) {
    console.error(`Failed to spawn "${cmd}": ${redact(r.error.message)}`);
  } else if (r.signal) {
    console.error(`"${cmd}" killed by signal ${r.signal}`);
  }
  return r;
};

export const main = async () => {
  const token = process.env.AZURE_STATIC_WEB_APPS_API_TOKEN;
  if (!token) {
    throw new Error(
      "AZURE_STATIC_WEB_APPS_API_TOKEN must be set to deploy the sandbox.",
    );
  }
  const { name, version } = JSON.parse(
    fs.readFileSync(path.join(pkgDir, "package.json"), "utf8"),
  );

  console.log(`Building ${name}@${version}...`);
  const build = run("pnpm", ["run", "build"], token);
  if (build.error || build.signal || build.status !== 0) {
    process.exitCode = build.error || build.signal ? 1 : (build.status ?? 1);
    return;
  }

  if (!fs.existsSync(buildDir)) {
    throw new Error(`Expected build output at ${buildDir}`);
  }

  console.log(`Deploying ${name}@${version} to alloyio.com...`);
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const deployment = run(
      "pnpm",
      [
        "exec",
        "swa",
        "deploy",
        buildDir,
        "--deployment-token",
        token,
        "--env",
        "production",
      ],
      token,
      true,
    );
    if (deployment.error || deployment.signal) {
      process.exitCode = 1;
      return;
    }
    if (deployment.status === 0) {
      return;
    }
    const output = `${deployment.stdout ?? ""}\n${deployment.stderr ?? ""}`;
    if (
      typeof deployment.status !== "number" ||
      attempt === 3 ||
      !isRetryable(output)
    ) {
      process.exitCode = deployment.status ?? 1;
      return;
    }
    const delay = attempt * 5000;
    if (stripVTControlCharacters(output).includes(metadataFailure)) {
      console.error(
        "StaticSitesClient metadata endpoint: https://aka.ms/swalocaldeploy",
      );
    }
    console.error(
      `SWA client metadata/download acquisition failed before deployment. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/3).`,
    );
    await setTimeout(delay);
  }
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
