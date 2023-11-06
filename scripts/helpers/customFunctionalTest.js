const readline = require("readline");
const createTestCafe = require("testcafe");
const glob = require("glob");
const path = require("path");
const componentNames = require("./componentNames");

const runTests = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const untouchableModules = [
    "context",
    "privacy",
    "identity",
    "datacollector",
    "libraryinfo"
  ];

  const componentChoices = Object.keys(componentNames).filter(
    name => !untouchableModules.includes(name)
  );
  componentChoices.forEach((name, index) => {
    console.log(`${index + 1}. ${name}`);
  });

  rl.question(
    "Enter the numbers of the components to exclude, separated by commas: ",
    async excludedComponentsInput => {
      const excludedComponents = excludedComponentsInput
        .split(",")
        .map(index => componentChoices[parseInt(index, 10) - 1]);

      if (excludedComponents.some(name => untouchableModules.includes(name))) {
        console.error(
          "You're trying to exclude an untouchable module. Don't even think about it, wise guy."
        );
        rl.close();
        return;
      }

      const includedPaths = Object.keys(componentNames)
        .filter(name => !excludedComponents.includes(name))
        .reduce((paths, name) => {
          const componentPath = path.resolve(
            __dirname,
            `../test/functional/specs/${componentNames[name]}`
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
          stopOnFirstFail: false
        });

      testcafe.close();
      rl.close();
      process.exit(failedCount ? 1 : 0);
    }
  );
};

runTests();
