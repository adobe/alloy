import { rollup } from "rollup";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { rename, writeFile } from "fs/promises";
import { join } from "path";
import { terser } from "rollup-plugin-terser";
import inquirer from "inquirer";
import { readFile } from "fs/promises";
import { format } from "prettier";

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
// const generateComponentCreatorsJS = components => {
//   const includedComponents = new Set(components);
//   const importStatements = [];
//   const exportedVariableNames = [];
//
//   if (includedComponents.has(ALLOY_COMPONENTS.ActivityCollector)) {
//     importStatements.push(
//       `import createDataCollector from "../components/DataCollector";`
//     );
//     exportedVariableNames.push("createDataCollector");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.Audiences)) {
//     importStatements.push(
//       `import createActivityCollector from "../components/ActivityCollector";`
//     );
//     exportedVariableNames.push("createActivityCollector");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.Context)) {
//     importStatements.push(
//       `import createIdentity from "../components/Identity";`
//     );
//     exportedVariableNames.push("createIdentity");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.Audiences)) {
//     importStatements.push(
//       `import createAudiences from "../components/Audiences";`
//     );
//     exportedVariableNames.push("createAudiences");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.Personalization)) {
//     importStatements.push(
//       `import createPersonalization from "../components/Personalization";`
//     );
//     exportedVariableNames.push("createPersonalization");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.Context)) {
//     importStatements.push(`import createContext from "../components/Context";`);
//     exportedVariableNames.push("createContext");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.LibraryInfo)) {
//     importStatements.push(`import createPrivacy from "../components/Privacy";`);
//     exportedVariableNames.push("createPrivacy");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.MachineLearning)) {
//     importStatements.push(
//       `import createEventMerge from "../components/EventMerge";`
//     );
//     exportedVariableNames.push("createEventMerge");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.LibraryInfo)) {
//     importStatements.push(
//       `import createLibraryInfo from "../components/LibraryInfo";`
//     );
//     exportedVariableNames.push("createLibraryInfo");
//   }
//   if (includedComponents.has(ALLOY_COMPONENTS.MachineLearning)) {
//     importStatements.push(
//       `import createMachineLearning from "../components/MachineLearning";`
//     );
//     exportedVariableNames.push("createMachineLearning");
//   }
//
//   return `${importStatements.join("\n")}
// export default [${exportedVariableNames.join(", ")}];`;
// };
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

import { format } from "prettier";

const generateComponentCreatorsJS = async (components) => {
  const includedComponents = new Set(components);
  let fileContent = await readFile("./src/core/componentCreators.js", "utf-8");
  let importStatements = [];
  let exportedVariableNames = [];

  for (const component in ALLOY_COMPONENTS) {
    if (includedComponents.has(ALLOY_COMPONENTS[component])) {
      importStatements.push(`import create${component} from "../components/${component}";`);
      exportedVariableNames.push(`create${component}`);
    }
  }

  fileContent = `/* eslint-disable import/no-restricted-paths */
  ${importStatements.join("\n")}
  export default [${exportedVariableNames.join(", ")}];`;

  const prettierConfig = await format.resolveConfig('./.prettierrc');
  fileContent = format(fileContent, { ...prettierConfig, parser: "babel" });

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

const build = async () => {
  await uncommentCode();
  const selectedComponents = (
    await inquirer.prompt([
      {
        type: "checkbox",
        message: "Select components to build:",
        name: "selectedComponents",
        choices: [
          {
            name: "Audiences",
            value: ALLOY_COMPONENTS.Audiences
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
          }
        ].map(({ value }) => value)
      }
    ])
  ).selectedComponents;

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
