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
const publishTag = async ({ exec, execSync, logger, version }) => {
  const publishedTagData = execSync(
    `git ls-remote gh-origin refs/tags/v${version}`,
  ).toString();
  if (publishedTagData !== "") {
    logger.warn(`Git tag v${version} already published.`);
  } else {
    logger.info(`Publishing Git tag v${version}.`);
    await exec("git tag", `git tag -a "v${version}" -m "${version}"`);
    await exec("git push", `git push gh-origin v${version}`);
  }
};

export default publishTag;
