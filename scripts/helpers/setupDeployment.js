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
const setupDeployment = async ({
  exec,
  githubActor,
  githubRepository,
  logger,
  npmToken,
}) => {
  logger.info("Configuring git.");
  await exec("git config", `git config user.name ${githubActor}`);
  await exec(
    "git config",
    `git config user.email gh-actions-${githubActor}@github.com`,
  );
  await exec(
    "git remote add",
    `git remote add gh-origin git@github.com:${githubRepository}.git`,
  );
  logger.info("Configuring NPM.");
  await exec(
    "npm config",
    `npm config set //registry.npmjs.org/:_auth=${npmToken}`,
  );
};

export default setupDeployment;
