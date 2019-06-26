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
import jscc from "rollup-plugin-jscc";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";
import replaceVersion from "./rollupPluginReplaceVersion";

const production = process.env.BUILD === "production";
const minify = process.env.MINIFY;
const destDirectory = production ? "dist/" : "sandbox/public/";
const minifiedExtension = minify ? ".min" : "";

const plugins = [
  jscc({
    values: {
      _DEV: !production
    }
  }),
  resolve({
    preferBuiltins: false,
    // Support the browser field in dependencies' package.json.
    // Useful for the uuid package.
    mainFields: ["module", "main", "browser"]
  }),
  commonjs(),
  babel(),
  replaceVersion()
];

if (minify) {
  plugins.push(terser());
}

if (production) {
  plugins.push(
    license({
      banner: {
        file: path.join(__dirname, "LICENSE_BANNER")
      }
    })
  );
}

export default {
  input: "src/core/main.js",
  output: [
    {
      file: `${destDirectory}alloy${minifiedExtension}.js`,
      format: "umd",
      // Allow non-IE browsers and IE11
      // document.documentMode was added in IE8, and is specific to IE.
      // IE7 and lower are not ES5 compatible so will get a parse error loading the library.
      intro:
        "if (document.documentMode && document.documentMode < 11) { console.warn('The Adobe Experience Cloud Web SDK does not support IE 10 and below.'); return; }"
    }
  ],
  plugins
};
