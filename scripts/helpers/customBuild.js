const fs = require("fs");
const { rollup } = require("rollup");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel").default;
const terser = require("rollup-plugin-terser").terser;
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const moduleNames = require("./moduleNames");
const conditionalBuildBabelPlugin = require("./conditionalBuildBabelPlugin");

const untouchableModules = ["context", "privacy", "identity"];

const argv = yargs(hideBin(process.argv))
  .scriptName("custom-builder")
  .usage(`$0 --exclude ${moduleNames.join(" ")}`)
  .option("exclude", {
    describe: "the modules that you want to be excluded from the build",
    choices: moduleNames,
    type: "array"
  })
  .array("exclude")
  // eslint-disable-next-line no-shadow
  .check(argv => {
    const forbiddenExclusions = (argv.exclude || []).filter(module =>
      untouchableModules.includes(module)
    );
    if (forbiddenExclusions.length > 0) {
      throw new Error(
        `You're not allowed to exclude the following modules: ${forbiddenExclusions.join(
          ", "
        )}. Nice try, though.`
      );
    }
    return true;
  }).argv;

const buildConfig = minify => {
  const plugins = [
    nodeResolve({
      preferBuiltins: false,
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    babel({
      plugins: [
        conditionalBuildBabelPlugin(
          (argv.exclude || []).reduce((previousValue, currentValue) => {
            if (moduleNames.includes(currentValue)) {
              previousValue[`alloy_${currentValue}`] = "false";
            }
            return previousValue;
          }, {})
        )
      ]
    })
  ];

  if (minify) {
    plugins.push(terser());
  }

  return {
    input: "src/standalone.js",
    output: [
      {
        file: `dist/alloy${minify ? ".min" : ""}.js`,
        format: "iife",
        intro:
          "if (document.documentMode && document.documentMode < 11) {\n" +
          "  console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');\n" +
          "  return;\n" +
          "}\n",
        sourcemap: false
      }
    ],
    plugins
  };
};

const getFileSizeInKB = filePath => {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  return (fileSizeInBytes / 1024).toFixed(2);
};

const buildWithComponents = async () => {
  const prodBuild = buildConfig(false);
  const minifiedBuild = buildConfig(true);

  const bundleProd = await rollup(prodBuild);
  console.log("✔️ Built alloy.js");
  await bundleProd.write(prodBuild.output[0]);
  console.log(`✔️ Wrote alloy.js to ${prodBuild.output[0].file}`);
  console.log(`📏 Size: ${getFileSizeInKB(prodBuild.output[0].file)} KB`);

  const bundleMinified = await rollup(minifiedBuild);
  console.log("✔️ Built alloy.min.js");
  await bundleMinified.write(minifiedBuild.output[0]);
  console.log(`✔️ Wrote alloy.min.js to ${minifiedBuild.output[0].file}`);
  console.log(`📏 Size: ${getFileSizeInKB(minifiedBuild.output[0].file)} KB`);

  const excludedPaths = (argv.exclude || []).map(component => {
    const dirName = component.toLowerCase();
    const moduleNameToDirName = {
      personalization: "Personalization",
      audiences: "Audiences",
      eventmerge: "EventMerge",
      libraryinfo: "LibraryInfo",
      machinelearning: "MachineLearning",
      identity: "Identity"
    };
    return `test/functional/specs/${moduleNameToDirName[dirName]}`;
  });
  fs.writeFileSync("custom-config.txt", excludedPaths.join("\n"));
};

buildWithComponents();
