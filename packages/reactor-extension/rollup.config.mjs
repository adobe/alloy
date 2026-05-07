/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import fs from "fs";
import path from "path";
import { createRequire } from "module";
import replace from "@rollup/plugin-replace";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

const requireFromConfig = createRequire(import.meta.url);

const getPackageVersion = (packageName) => {
  let dir = path.dirname(requireFromConfig.resolve(packageName));

  while (dir !== path.dirname(dir)) {
    const packageJsonPath = path.join(dir, "package.json");
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
      if (pkg.name === packageName) {
        return pkg.version;
      }
    }
    dir = path.dirname(dir);
  }

  throw new Error(`Unable to resolve ${packageName} package version.`);
};

const alloyVersion = getPackageVersion("@adobe/alloy");

export default [
  {
    input: "src/lib/alloy.js",
    output: [
      {
        file: "temp/alloy.js",
      },
    ],
    plugins: [
      replace({
        __VERSION__: alloyVersion,
        preventAssignment: true,
      }),
      nodeResolve({
        preferBuiltins: false,
        mainFields: ["module", "main", "browser"],
      }),
      commonjs(),
    ],
    external: ["@adobe/reactor-query-string"],
  },
];
