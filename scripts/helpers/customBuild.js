const fs = require("fs");
const { rollup } = require("rollup");
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const commonjs = require("@rollup/plugin-commonjs");
const babel = require("@rollup/plugin-babel").default;
const terser = require("rollup-plugin-terser").terser;
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const componentNames = require("./componentNames");
const conditionalBuildBabelPlugin = require("./conditionalBuildBabelPlugin");

const untouchableModules = [
  "context",
  "privacy",
  "identity",
  "datacollector",
  "libraryinfo"
];

const argv = yargs(hideBin(process.argv))
  .scriptName("custom-builder")
  .usage(
    `$0 --exclude ${componentNames.map(component => component.name).join(" ")}`
  )
  .option("exclude", {
    describe: "the components that you want to be excluded from the build",
    choices: componentNames.map(component => component.name),
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

if (!argv.exclude) {
  console.log(
    `Looks like you're trying to build without excluding any components, try running "npm run custom:build -- --exclude personalization". Your choices are: ${componentNames
      .map(component => component.name)
      .filter(name => !untouchableModules.includes(name))
      .join(", ")}`
  );
  process.exit(0);
}

const buildConfig = (minify, sandbox) => {
  const plugins = [
    nodeResolve({
      preferBuiltins: false,
      mainFields: ["component", "main", "browser"]
    }),
    commonjs(),
    babel({
      plugins: [
        conditionalBuildBabelPlugin(
          (argv.exclude || []).reduce((previousValue, currentValue) => {
            if (
              componentNames
                .map(component => component.name)
                .includes(currentValue)
            ) {
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

  let filename = `dist/alloy${minify ? ".min" : ""}.js`;
  if (sandbox) {
    filename = `sandbox/public/alloy${minify ? ".min" : ""}.js`;
  }

  return {
    input: "src/standalone.js",
    output: [
      {
        file: filename,
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

const buildWithComponents = async sandbox => {
  const prodBuild = buildConfig(false, sandbox);
  const minifiedBuild = buildConfig(true, sandbox);

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
};

buildWithComponents(!!process.env.SANDBOX);