#!/usr/bin/env node

/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { execSync } from "child_process";
import { createRequire } from "module";
import urlExists from "url-exists-nodejs";
import createLogger from "./helpers/createLogger.js";
import exec from "./helpers/exec.js";
import publishTag from "./helpers/publishTag.js";
import publishToNpm from "./helpers/publishToNpm.js";
import publishVersionBranch from "./helpers/publishVersionBranch.js";
import setupDeployment from "./helpers/setupDeployment.js";
import updateDevDependency from "./helpers/updateDevDependency.js";
import updatePackageVersion from "./helpers/updatePackageVersion.js";
import uploadToCDN from "./helpers/uploadToCDN.js";
import withErrorHandling from "./helpers/withErrorHandling.js";

const require = createRequire(import.meta.url);
const { version: currentVersion } = require("../package.json");

const logger = createLogger(console, () => Date.now());

const args = process.argv.slice(2);

if (args.length < 2) {
  logger.error("Usage: ./deploy.js version npmTag");
  logger.error("Deploy failed.");
  process.exit(1);
}

const [version, npmTag] = args;

// dependency injection container
const container = {
  currentVersion,
  exec,
  execSync,
  githubActor: process.env.GITHUB_ACTOR,
  githubRef: process.env.GITHUB_REF,
  githubRepository: process.env.GITHUB_REPOSITORY,
  logger,
  npmTag,
  npmToken: process.env.NPM_TOKEN,
  process,
  urlExists,
  version,
};

const run = async () => {
  await setupDeployment(container);
  await updatePackageVersion(container);
  await publishToNpm(container);
  await updateDevDependency(container);
  await publishTag(container);
  await publishVersionBranch(container);
  await uploadToCDN(container);
};

withErrorHandling(container, `Deploy ${version}`, run);
