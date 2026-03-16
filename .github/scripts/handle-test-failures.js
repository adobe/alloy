/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

module.exports = async ({ github, context, browser }) => {
  const fs = require("fs");
  const path = require("path");

  // Read the test results
  const testResultsDir = "./test-results";
  const files = fs.readdirSync(testResultsDir);

  const failedResults = files
    .map((file) => {
      const content = fs.readFileSync(path.join(testResultsDir, file), "utf8");
      try {
        return JSON.parse(content);
      } catch (error) {
        console.error(`Error parsing JSON from ${file}: ${error}`);
        return null;
      }
    })
    .filter((result) => result && result.status === "failed");

  await Promise.all(
    failedResults.map(async (result) => {
      const testName = result.name;
      const sauceLabsLink = `https://app.saucelabs.com/tests/${result.id}`;

      // Search for an existing issue
      const issues = await github.rest.issues.listForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
        state: "open",
        labels: ["test-failure", browser],
      });

      const existingIssue = issues.data.find((issue) =>
        issue.title.includes(testName),
      );

      if (existingIssue) {
        // Update existing issue
        await github.rest.issues.createComment({
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: existingIssue.number,
          body: `Test failed again in the latest run.\nBrowser: ${browser}\nRun: ${context.runId}\n[View on SauceLabs](${sauceLabsLink})`,
        });
      } else {
        // Create new issue
        await github.rest.issues.create({
          owner: context.repo.owner,
          repo: context.repo.repo,
          title: `Test Failure: ${testName} (${browser})`,
          body: `The test "${testName}" failed in the ${browser} browser.\n\nRun: ${context.runId}\n[View on SauceLabs](${sauceLabsLink})`,
          labels: ["test-failure", browser],
        });
      }
    }),
  );
};
