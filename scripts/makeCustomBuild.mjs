import { rollup } from "rollup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { rename, writeFile } from "fs/promises";
import { join } from "path";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import inquirer from "inquirer";

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
const generateComponentCreatorsJS = components => {
  const includedComponents = new Set(components);
  const importStatements = [];
  const exportedVariableNames = [];

  if (includedComponents.has(ALLOY_COMPONENTS.ActivityCollector)) {
    importStatements.push(
      `import createDataCollector from "../components/DataCollector";`
    );
    exportedVariableNames.push("createDataCollector");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.Audiences)) {
    importStatements.push(
      `import createActivityCollector from "../components/ActivityCollector";`
    );
    exportedVariableNames.push("createActivityCollector");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.Context)) {
    importStatements.push(
      `import createIdentity from "../components/Identity";`
    );
    exportedVariableNames.push("createIdentity");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.Audiences)) {
    importStatements.push(
      `import createAudiences from "../components/Audiences";`
    );
    exportedVariableNames.push("createAudiences");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.Personalization)) {
    importStatements.push(
      `import createPersonalization from "../components/Personalization";`
    );
    exportedVariableNames.push("createPersonalization");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.Context)) {
    importStatements.push(`import createContext from "../components/Context";`);
    exportedVariableNames.push("createContext");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.LibraryInfo)) {
    importStatements.push(`import createPrivacy from "../components/Privacy";`);
    exportedVariableNames.push("createPrivacy");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.MachineLearning)) {
    importStatements.push(
      `import createEventMerge from "../components/EventMerge";`
    );
    exportedVariableNames.push("createEventMerge");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.LibraryInfo)) {
    importStatements.push(
      `import createLibraryInfo from "../components/LibraryInfo";`
    );
    exportedVariableNames.push("createLibraryInfo");
  }
  if (includedComponents.has(ALLOY_COMPONENTS.MachineLearning)) {
    importStatements.push(
      `import createMachineLearning from "../components/MachineLearning";`
    );
    exportedVariableNames.push("createMachineLearning");
  }

  return `${importStatements.join("\n")}
export default [${exportedVariableNames.join(", ")}];`;
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
const build = async () => {
  const selectedComponents = (
    await inquirer.prompt([
      {
        type: "checkbox",
        message: "Select components to build:",
        name: "selectedComponents",
        choices: [
          {
            name: "Activity Collector",
            value: ALLOY_COMPONENTS.ActivityCollector
          },
          {
            name: "Audiences",
            value: ALLOY_COMPONENTS.Audiences
          },
          { name: "Context", value: ALLOY_COMPONENTS.Context },
          {
            name: "Data Collector",
            value: ALLOY_COMPONENTS.DataCollector
          },
          {
            name: "Identity",
            value: ALLOY_COMPONENTS.Identity
          },
          {
            name: "Event Merge",
            value: ALLOY_COMPONENTS.EventMerge
          },
          {
            name: "Library Info",
            value: ALLOY_COMPONENTS.LibraryInfo
          },
          {
            name: "Machine Learning",
            value: ALLOY_COMPONENTS.MachineLearning
          },
          {
            name: "Personalization",
            value: ALLOY_COMPONENTS.Personalization
          },
          { name: "Privacy", value: ALLOY_COMPONENTS.Privacy }
        ].map(({ value }) => value)
      }
    ])
  ).selectedComponents;

  // generate the componentCreators.js file
  const componentCreatorsJS = generateComponentCreatorsJS(selectedComponents);
  // move the old componentCreators.js file to componentCreators.js.bak
  const componentCreatorsFilePath = join(
    process.env.npm_config_local_prefix,
    "src/core/componentCreators.js"
  );
  await rename(componentCreatorsFilePath, `${componentCreatorsFilePath}.bak`);
  console.log(
    "✔️ Moved old componentCreators.js file to componentCreators.js.bak"
  );
  // write the new componentCreators.js file
  await writeFile(componentCreatorsFilePath, componentCreatorsJS);
  console.log(
    `✔️ Wrote new componentCreators.js file for ${selectedComponents.length} components`
  );
  // build alloy
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

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
