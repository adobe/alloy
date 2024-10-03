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
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import createFixture from "../../helpers/createFixture/index.js";
import { TEST_PAGE } from "../../helpers/constants/url.js";

const buildScript = path.resolve(
  __dirname,
  "../../../../scripts/alloyBuilder.js",
);
const outputDir = path.resolve(__dirname, "../../../../customBuilds");

const allComponents = [
  "activityCollector",
  "audiences",
  "context",
  "decisioningEngine",
  "eventMerge",
  "machineLearning",
  "personalization",
  "privacy",
  "streamingMedia",
];

const runBuild = async (components) => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    let command = `node ${buildScript} build --outputDir ${outputDir}`;
    // Only add the --exclude flag if components are specified
    if (components.length > 0) {
      command += ` --exclude ${components.join(",")}`;
    }

    exec(command, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
};

const checkBuild = async (t, excludedComponents) => {
  const buildPath = path.join(outputDir, "alloy.min.js");
  const content = await fs.promises.readFile(buildPath, "utf8");

  excludedComponents.forEach(async (component) => {
    const componentName = `create${component.charAt(0).toUpperCase() + component.slice(1)}`;
    if (content.includes(componentName)) {
      await t.expect(false).ok(`Unexpected component found: ${componentName}`);
    }
  });

  const includedComponents = allComponents.filter(
    (c) => !excludedComponents.includes(c),
  );
  const presentComponents = [];
  const missingComponents = [];

  includedComponents.forEach(async (component) => {
    const componentName = component.toLowerCase();
    const isIncluded = content.toLowerCase().includes(componentName);

    if (isIncluded) {
      presentComponents.push(component);
    } else {
      missingComponents.push(component);
    }

    await t
      .expect(isIncluded)
      .ok(
        `Expected to find ${component} in the built file, but it was not present.`,
      );
  });

  // Ensure that all expected components are present when building with all components
  if (excludedComponents.length === 0) {
    await t
      .expect(presentComponents.length)
      .eql(
        allComponents.length,
        "All components should be present in the build",
      );
  } else {
    // Ensure that at least some components are present for partial builds
    await t
      .expect(presentComponents.length)
      .gt(0, "At least one component should be present in the build");
  }

  // Optional: Add an assertion to check if any unexpected components are missing
  await t
    .expect(missingComponents.length)
    .eql(0, `Unexpected missing components: ${missingComponents.join(", ")}`);
};

createFixture({
  title: "Alloy Builder Custom Builds",
  url: TEST_PAGE,
});

test("Build Alloy with all components included", async (t) => {
  await runBuild([]);
  await checkBuild(t, []);
});

test("Build Alloy excluding a single component", async (t) => {
  const excludedComponent = "personalization";
  await runBuild([excludedComponent]);
  await checkBuild(t, [excludedComponent]);
});

test("Build Alloy excluding multiple components", async (t) => {
  const excludedComponents = ["audiences", "context", "personalization"];
  await runBuild(excludedComponents);
  await checkBuild(t, excludedComponents);
});

test("Build Alloy with minimum components", async (t) => {
  const includedComponent = "audiences";
  const excludedComponents = allComponents.filter(
    (c) => c !== includedComponent,
  );
  await runBuild(excludedComponents);
  await checkBuild(t, excludedComponents);
});

test("Build Alloy with various combinations", async (t) => {
  const combinations = [
    ["activityCollector", "audiences", "context"],
    ["decisioningEngine", "eventMerge"],
    ["machineLearning", "personalization", "privacy"],
    ["activityCollector", "decisioningEngine", "personalization"],
    ["audiences", "machineLearning", "privacy"],
  ];

  combinations.forEach(async (combination) => {
    await runBuild(combination);
    await checkBuild(t, combination);
  });
});
