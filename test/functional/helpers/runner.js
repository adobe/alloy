const createTestCafe = require("testcafe");
const glob = require("glob");
const supportedBrowsers = require("./supportedBrowsers");
require("dotenv").config();

let browsers = () => {
  let envVar = "BROWSERS";
  return envVar in process.env
    ? process.env[envVar].split(",")
    : supportedBrowsers;
};

// Determine which test files to run
// Returns an array.
// Each element in the array is a group of tests.
// The tests are expected to be run sequentially and only continuing if the previous tests passed.
//
// For example, if no files are specified the first element will be the smoke test and the second will be the rest of the tests.
// This indicates that the smoke test should be run (to determine if there were any deployment or configuration issues) before proceeding with the more detailed tests.
let testFiles = () => {
  let envVar = "TEST_FILES";

  if (envVar in process.env) {
    return [glob.sync(process.env[envVar])];
  }
};

let run = (listOfTests, listOfBrowsers = browsers()) => {
  let testcafe = null;
  createTestCafe("localhost", 1337, 1338)
    .then(tc => {
      testcafe = tc;
      const runner = testcafe.createRunner();

      if (listOfTests.length == 0) {
        return;
      }
      let tests = listOfTests[0];

      if (!process.env.URL) {
        throw new ReferenceError(
          "URL environment variable is required to run tests"
        );
      }

      return runner
        .src(tests)
        .browsers(browsers())
        .run({ skipJsErrors: true });
    })
    .then(async failedCount => {
      console.log("Tests failed: " + failedCount);
      await testcafe.close();
      if (failedCount == 0 && listOfTests.length > 1) {
        run(listOfTests.slice(1), listOfBrowsers);
      }
    })
    .catch(err => {
      console.error(err);
      testcafe.close();
    });
};

run(testFiles());
