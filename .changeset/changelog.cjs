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

/* eslint-env node */
/* global require, module, process */
// Wrapper around changesets to use @changesets/changelog-github when there is a GITHUB_TOKEN
// and @changesets/cli/changelog otherwise.

const defaultChangelog = require("@changesets/cli/changelog");

let githubChangelog;
try {
  githubChangelog = require("@changesets/changelog-github");
} catch {
  githubChangelog = null;
}

const canUseGithubChangelog = () =>
  Boolean(githubChangelog && process.env.GITHUB_TOKEN);

module.exports = {
  getReleaseLine: async (changeset, type, options) => {
    if (canUseGithubChangelog()) {
      return githubChangelog.getReleaseLine(changeset, type, options);
    }
    return defaultChangelog.getReleaseLine(changeset, type, options);
  },
  getDependencyReleaseLine: async (
    changesets,
    dependenciesUpdated,
    options,
  ) => {
    if (canUseGithubChangelog()) {
      return githubChangelog.getDependencyReleaseLine(
        changesets,
        dependenciesUpdated,
        options,
      );
    }
    return defaultChangelog.getDependencyReleaseLine(
      changesets,
      dependenciesUpdated,
      options,
    );
  },
};
