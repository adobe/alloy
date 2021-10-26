#! /usr/bin/env node

const { execSync } = require("child_process");

const version = "2.6.4-beta.1";
const publishVersionJson = execSync(
  `npm view @adobe/alloy@${version} version --json`
);
console.log(publishVersionJson);
