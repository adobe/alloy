#!/usr/bin/env node

const fs = require("fs");
const glob = require("glob");
const createTestCafe = require("testcafe");

fs.readFile("dist/alloy.js", "utf8", (readFileErr, alloyData) => {
  if (readFileErr) {
    console.error(`readFile error: ${readFileErr}`);
    return;
  }

  // Extract componentCreators array from alloyData
  const componentCreatorsMatch = alloyData.match(
    /var componentCreators = \[(.*?)\];/s
  );
  if (!componentCreatorsMatch) {
    console.error("componentCreators array not found in dist/alloy.js");
    return;
  }
  const componentCreators = componentCreatorsMatch[1]
    .split(",")
    .map(name => name.trim().replace("create", ""));

  // Convert component creator function names to component names
  const componentNames = componentCreators.map(
    creator => creator.charAt(0).toLowerCase() + creator.slice(1) // Ensure first letter is lowercase to match directory names
  );

  // Define a mapping from component names to their test directory names
  const componentNameToTestDirMapping = {
    dataCollector: "Data Collector",
    activityCollector: "Activity Collector",
    identity: "Identity",
    audiences: "Audiences",
    context: "Context",
    privacy: "Privacy",
    eventMerge: "EventMerge",
    libraryInfo: "LibraryInfo",
    machineLearning: "MachineLearning",
    decisioningEngine: "DecisioningEngine"
  };

  // Adjust componentNames using the mapping
  const adjustedComponentNames = componentNames.map(
    name => componentNameToTestDirMapping[name] || name
  );

  // Generate a glob pattern to match only the included components' test specs
  const includedComponentsPattern = adjustedComponentNames.join("|");
  const testSpecsGlobPattern = `test/functional/specs/@(${includedComponentsPattern})/**/*.js`;

  glob(testSpecsGlobPattern, (globErr, files) => {
    if (globErr) {
      console.error(globErr);
      process.exit(1);
    }

    if (files.length === 0) {
      console.log("No test files found for the included components.");
      return;
    }

    createTestCafe().then(testcafe => {
      const runner = testcafe.createRunner();
      runner
        .src(files)
        .browsers("chrome")
        .run()
        .then(failedCount => {
          console.log(`Tests finished. Failed count: ${failedCount}`);
          testcafe.close();
        });
    });
  });
});
