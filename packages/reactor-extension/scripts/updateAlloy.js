#!/usr/bin/env node

// Updates alloy version in package.json. For example:
// 2.5.0-alpha.0 => 2.5.0-beta.4
// 2.5.0-beta.4 => 2.5.0

// This will not update to the next major/minor/patch version,
// but only update the prerelease version or remove the prerelease
// qualifier. So it will NOT do this:
// 2.5.0-beta.4 => 2.6.0-beta.0
// 2.5.0 => 2.6.0-beta.0

// We do this instead of pnpm update so that we are explicit about
// the exact version number required in package.json.

const { execSync } = require("child_process");

const {
  dependencies: {
    "@adobe/alloy": { version: currentVersion },
  },
} = JSON.parse(execSync("pnpm ls @adobe/alloy --json"))[0];

// fetch any releases greater than or equal to the current version, with the current major/minor/patch number.
const npmView = JSON.parse(
  execSync(`pnpm view @adobe/alloy@~${currentVersion} version --json`),
);
// npmView is either a single string or an array of strings
// eslint-disable-next-line no-console
console.log(npmView);
const newestVersion = Array.isArray(npmView)
  ? npmView[npmView.length - 1]
  : npmView;

if (currentVersion !== newestVersion) {
  // eslint-disable-next-line no-console
  console.log(`Updating @adobe/alloy dependency to ${newestVersion}.`);
  execSync(`pnpm add --save-exact @adobe/alloy@${newestVersion}`);
}
