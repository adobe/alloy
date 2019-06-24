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
import replaceVersion from "./rollupPluginReplaceVersion";

export default {
  input: "src/core/main.js",
  output: [
    {
      file: "dist/alloy.min.js",
      format: "umd"
    },
    {
      file: "sandbox/public/alloy.min.js",
      format: "umd"
    }
  ],
  plugins: [
    resolve({ preferBuiltins: false }),
    commonjs(),
    babel(),
    replaceVersion(),
    terser(),
    license({
      banner: {
        file: path.join(__dirname, "LICENSE_BANNER")
      }
    })
  ]
};
