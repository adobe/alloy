#!/usr/bin/env node

const glob = require("glob");
const createTestCafe = require("testcafe");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const argv = yargs(hideBin(process.argv)).option("exclude", {
  type: "array",
  default: []
}).argv;

glob("test/functional/specs/**/*.js", (err, files) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  const testFiles = files.filter(file => {
    const shouldExclude = argv.exclude.some(excludedDir =>
      file.includes(excludedDir)
    );
    return !shouldExclude;
  });

  createTestCafe().then(testcafe => {
    const runner = testcafe.createRunner();
    runner
      .src(testFiles)
      .browsers("chrome")
      .run()
      .then(() => testcafe.close());
  });
});
