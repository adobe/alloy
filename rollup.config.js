/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import path from "path";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";

const buildTargets = {
  PROD: "prod",
  DEV: "dev"
};

const destDirectoryByBuildTarget = {
  [buildTargets.PROD]: "dist/",
  [buildTargets.DEV]: "sandbox/public/"
};

const buildTarget = process.env.BUILD || buildTargets.DEV;
const minify = process.env.MINIFY;
const destDirectory = destDirectoryByBuildTarget[buildTarget];

const minifiedExtension = minify ? ".min" : "";

const plugins = [
  resolve({
    preferBuiltins: false,
    // Support the browser field in dependencies' package.json.
    // Useful for the uuid package.
    mainFields: ["module", "main", "browser"]
  }),
  commonjs(),
  babel()
];

if (minify) {
  plugins.push(
    terser({
      mangle: true,
      compress: {
        unused: false
      }
    })
  );
}

if (buildTarget !== buildTargets.DEV) {
  plugins.push(
    license({
      banner: {
        file: path.join(__dirname, "LICENSE_BANNER")
      }
    })
  );
}

const config = [];

if (buildTarget === buildTargets.PROD) {
  config.push({
    input: "src/baseCode.js",
    output: [
      {
        file: `${destDirectory}baseCode${minifiedExtension}.js`,
        format: "iife"
      }
    ],
    plugins
  });
}

config.push({
  input: "src/standAlone.js",
  output: [
    {
      file: `${destDirectory}alloy${minifiedExtension}.js`,
      format: "iife",
      intro:
        "if (document.documentMode && document.documentMode < 11) {\n" +
        "  console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.');\n" +
        "  return;\n" +
        "}\n"
    }
  ],
  plugins
});

if (buildTarget === buildTargets.PROD && !minify) {
  config.push({
    input: "src/index.js",
    output: [
      {
        file: `${destDirectory}index.js`,
        format: "es"
      }
    ],
    // The @adobe/reactor-* dependencies are specified as peerDependencies so no need to include them in the
    // module build
    external(name) {
      return /^@adobe\/reactor-/.test(name);
    },
    plugins
  });
}

export default config;
