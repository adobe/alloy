#! /usr/bin/env node

const { execSync } = require("child_process");
const urlExists = require("url-exists-nodejs");
const { version: currentVersion } = require("../package.json");

const createLogger = require("./helpers/createLogger");
const exec = require("./helpers/exec");
const publishTag = require("./helpers/publishTag");
const publishToNpm = require("./helpers/publishToNpm");
const setupDeployment = require("./helpers/setupDeployment");
const updateDevDependency = require("./helpers/updateDevDependency");
const updatePackageVersion = require("./helpers/updatePackageVersion");
const uploadToCDN = require("./helpers/uploadToCDN");
const withErrorHandling = require("./helpers/withErrorHandling");

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
  version
};

const run = async () => {
  await setupDeployment(container);
  await updatePackageVersion(container);
  await publishToNpm(container);
  await updateDevDependency(container);
  await publishTag(container);
  await uploadToCDN(container);
};

withErrorHandling(container, `Deploy ${version}`, run);
