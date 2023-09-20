import { rollup } from "rollup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { rename, writeFile } from "fs/promises";
import { join } from "path";
import { terser } from "rollup-plugin-terser";
import inquirer from "inquirer";
import { readFile } from "fs/promises";

const NPM_PACKAGE_PROD = "NPM_PACKAGE_PROD";
const ALLOY_COMPONENTS = {
  ActivityCollector: "ActivityCollector",
  Audiences: "Audiences",
  Context: "Context",
  DataCollector: "DataCollector",
  EventMerge: "EventMerge",
  Identity: "Identity",
  LibraryInfo: "LibraryInfo",
  MachineLearning: "MachineLearning",
  Personalization: "Personalization",
  Privacy: "Privacy"
};

/**
 * @param {string[]} components
 * @returns
 */
const uncommentCode = async () => {
  let fileContent = await readFile("./src/core/componentCreators.js", "utf-8");
  // Remove comments from the import statements
  fileContent = fileContent.replace(/\/\/ import create/g, 'import create');
  // Remove comments from the export default
  fileContent = fileContent.replace(/\/\/ create/g, 'create');
  // Write the uncommented code back to the file
  await writeFile("./src/core/componentCreators.js", fileContent);
  console.log("✔️ Removed comments from the import statements and export default");
};

uncommentCode().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

const generateComponentCreatorsJS = async (components) => {
  const excludedComponents = new Set(components);
  let fileContent = await readFile("./src/core/componentCreators.js", "utf-8");
  let importStatements = [];
  let exportedVariableNames = [];

  for (const component in ALLOY_COMPONENTS) {
    if (!excludedComponents.has(ALLOY_COMPONENTS[component])) {
      importStatements.push(`import create${component} from "../components/${component}";`);
      exportedVariableNames.push(`create${component}`);
    }
  }

  fileContent = `/* eslint-disable import/no-restricted-paths */
  ${importStatements.join("\n")}
  export default [${exportedVariableNames.join(", ")}];`;

  return fileContent;
};
const buildConfig = (variant, minify) => {
  const plugins = [
    resolve({
      preferBuiltins: false,
      mainFields: ["module", "main", "browser"]
    }),
    commonjs(),
    babel({
      envName: "rollup",
      configFile: "./babel.config.js"
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

const buildWithComponents = async (components) => {
  await uncommentCode();
  const selectedComponents = components;

  // generate the componentCreators.js file
  const componentCreatorsJS = await generateComponentCreatorsJS(selectedComponents);
  const componentCreatorsFilePath = join(
    process.env.npm_config_local_prefix,
    "src/core/componentCreators.js"
  );
  // write the new componentCreators.js file
  await writeFile(componentCreatorsFilePath, componentCreatorsJS);
  console.log(
    `✔️ Updated componentCreators.js file for ${selectedComponents.length} components`
  );
  // buildWithComponents alloy
  const prodBuild = buildConfig(NPM_PACKAGE_PROD, false);
  const minBuild = buildConfig(NPM_PACKAGE_PROD, true);

  // Build all configurations with Rollup
  const bundleProd = await rollup(prodBuild);
  console.log("✔️ Built alloy.js");
  await bundleProd.write(prodBuild.output[0]);
  console.log(`✔️ Wrote alloy.js to ${prodBuild.output[0].file}`);

  const bundleMin = await rollup(minBuild);
  console.log("✔️ Built alloy.min.js");
  await bundleMin.write(minBuild.output[0]);
  console.log(`✔️ Wrote alloy.min.js to ${minBuild.output[0].file}`);
};

// Get the components from the command line arguments
const components = process.argv.slice(2);
buildWithComponents(components).catch(error => {
  console.error(error);
  process.exitCode = 1;
});

buildWithComponents().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
