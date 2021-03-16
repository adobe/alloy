#!/usr/bin/env node

/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { Octokit } = require("@octokit/rest");

// Outputs the production version of Alloy. This is calculated
// by looking up the latest release in Github that is neither
// a draft nor pre-release, then retrieving the package.json
// from the release's associated tag, then logging the value
// of the version field found in package.json.
const octokit = new Octokit({
  // These APIs have a rate limit of 60/hour total (across all
  // APIs, per IP address) when unauthenticated, but a rate limit
  // of 1000/hr when using the Github token for authentication
  // (15000/hr if we upgrade to a GitHub Enterprise Cloud account).
  // We'll use the Github token when it's available (when this script
  // is running as part of a Github workflow).
  auth: process.env.GITHUB_TOKEN
});

octokit.repos
  .listReleases({
    owner: "adobe",
    repo: "alloy"
  })
  .then(response => {
    const releases = response.data;
    const prodRelease = releases.find(release => {
      return !release.draft && !release.prerelease;
    });

    if (!prodRelease) {
      throw new Error("No github production release found.");
    }

    return octokit.repos.getContent({
      owner: "adobe",
      repo: "alloy",
      path: "package.json",
      ref: prodRelease.tag_name
    });
  })
  .then(response => {
    // The content is base 64 encoded.
    const pkgJson = Buffer.from(
      response.data.content,
      response.data.encoding
    ).toString();
    const pkg = JSON.parse(pkgJson);
    console.log(pkg.version);
  });
