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
/* global process */
// Wrapper around changesets to use @changesets/changelog-github when there is a GITHUB_TOKEN
// and @changesets/cli/changelog otherwise.

import * as defaultChangelogModule from "@changesets/cli/changelog";

const githubChangelogPromise = import("@changesets/changelog-github").catch(
  () => null,
);

const unwrapModule = (module) => module?.default ?? module;

const defaultChangelog = unwrapModule(defaultChangelogModule);

const getGithubChangelogIfAvailable = async () => {
  const githubModule = await githubChangelogPromise;
  if (!githubModule) {
    return null;
  }

  const githubImpl = unwrapModule(githubModule);

  if (!process.env.GITHUB_TOKEN) {
    return null;
  }

  if (typeof githubImpl.getReleaseLine !== "function") {
    return null;
  }

  if (typeof githubImpl.getDependencyReleaseLine !== "function") {
    return null;
  }

  return githubImpl;
};

export default {
  getReleaseLine: async (changeset, type, options) => {
    const githubImpl = await getGithubChangelogIfAvailable();
    if (githubImpl) {
      return githubImpl.getReleaseLine(changeset, type, options);
    }
    return defaultChangelog.getReleaseLine(changeset, type, options);
  },
  getDependencyReleaseLine: async (
    changesets,
    dependenciesUpdated,
    options,
  ) => {
    const githubImpl = await getGithubChangelogIfAvailable();
    if (githubImpl) {
      return githubImpl.getDependencyReleaseLine(
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
