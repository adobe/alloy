#!/usr/bin/env node

const fs = require("fs");
const glob = require("glob");
const createTestCafe = require("testcafe");

fs.readFile("dist/alloy.js", "utf8", (readFileErr, data) => {
  if (readFileErr) {
    console.error(`readFile error: ${readFileErr}`);
    return;
  }

  glob("test/functional/specs/**/*.js", (globErr, files) => {
    if (globErr) {
      console.error(globErr);
      process.exit(1);
    }

    let componentNames = files.map(file => file.split("/")[3]);
    componentNames = [...new Set(componentNames)]; // remove duplicates

    const testFiles = [];
    const excludedComponents = [];

    componentNames.forEach(name => {
      if (data.includes(`alloy_${name}`)) {
        testFiles.push(files.find(file => file.split("/")[3] === name));
      } else {
        excludedComponents.push(name);
      }
    });

    if (excludedComponents.length > 0) {
      console.log(`Excluding components: ${excludedComponents.join(", ")}`);
    }

    createTestCafe().then(testcafe => {
      const runner = testcafe.createRunner();
      runner
        .src(testFiles)
        .browsers("chrome")
        .run()
        .then(() => testcafe.close());
    });
  });
});
