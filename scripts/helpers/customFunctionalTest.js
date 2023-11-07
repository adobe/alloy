const createTestCafe = require("testcafe");
const glob = require("glob");
const path = require("path");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const componentNames = require("./componentNames");

let untouchableModules;
// eslint-disable-next-line prefer-const
untouchableModules = [
  "context",
  "privacy",
  "identity",
  "datacollector",
  "libraryinfo"
];

const argv = yargs(hideBin(process.argv))
  .scriptName("custom-test-runner")
  .usage(`$0 --exclude ${Object.keys(componentNames).join(" ")}`)
  .option("exclude", {
    describe: "the components that you want to be excluded from the tests",
    choices: Object.keys(componentNames),
    type: "array"
  })
  .array("exclude")
  // eslint-disable-next-line no-shadow
  .check(argv => {
    const forbiddenExclusions = (argv.exclude || []).filter(component =>
      untouchableModules.includes(component)
    );
    if (forbiddenExclusions.length > 0) {
      throw new Error(
        `You're not allowed to exclude the following components: ${forbiddenExclusions.join(
          ", "
        )}.`
      );
    }
    return true;
  }).argv;

const excludedComponents = argv.exclude || [];

const runTests = async () => {
  const includedPaths = Object.keys(componentNames)
    .filter(name => !excludedComponents.includes(name))
    .reduce((paths, name) => {
      const componentPath = path.resolve(
        __dirname,
        `../../test/functional/specs/${componentNames[name]}`
      );
      const componentFiles = glob.sync(`${componentPath}/*.js`);
      return paths.concat(componentFiles);
    }, []);

  const testcafe = await createTestCafe("localhost", 1337, 1338);
  const runner = testcafe.createRunner();

  const failedCount = await runner
    .src(includedPaths)
    .browsers("chrome")
    .run({
      skipJsErrors: true,
      quarantineMode: true,
      selectorTimeout: 50000,
      assertionTimeout: 7000,
      pageLoadTimeout: 8000,
      speed: 0.75,
      stopOnFirstFail: false,
      disablePageCaching: true
    });

  testcafe.close();
  process.exit(failedCount ? 1 : 0);
};

runTests();
