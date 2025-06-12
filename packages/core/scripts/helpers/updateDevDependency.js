/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
const updateDevDependency = async ({
  exec,
  execSync,
  githubRef,
  logger,
  version,
}) => {
  const {
    dependencies: {
      "@adobe/alloy": { version: installedVersion },
    },
  } = JSON.parse(execSync(`npm ls @adobe/alloy --json`).toString());
  if (installedVersion === version) {
    logger.warn(`Dependency @adobe/alloy@${version} already installed.`);
  } else {
    logger.info(`Installing @adobe/alloy@${version} as a dev dependency.`);
    await exec("npm install", `npm install @adobe/alloy@${version} --save-dev`);
    await exec("git add", `git add package.json package-lock.json`);
    await exec(
      "git commit",
      `git commit -m "[skip ci] update self devDependency to ${version}"`,
    );
    await exec("git push", `git push gh-origin HEAD:${githubRef}`);
  }
};

export default updateDevDependency;
