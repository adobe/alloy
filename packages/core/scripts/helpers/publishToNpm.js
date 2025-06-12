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
const publishToNpm = async ({ exec, execSync, logger, npmTag, version }) => {
  let publishVersionJson = "";
  try {
    publishVersionJson = execSync(
      `npm view @adobe/alloy@${version} version --json`,
    ).toString();
  } catch {
    // the error is already printed to stdErr
  }
  if (publishVersionJson !== "") {
    logger.warn(`NPM already has version ${version}.`);
  } else {
    logger.info("Publishing NPM package.");
    await exec("npm publish", `npm publish -access public --tag ${npmTag}`);
    await exec("sleep 60", "sleep 60");
  }
};

export default publishToNpm;
