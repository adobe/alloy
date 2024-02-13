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

/*
 * This file is used in 4 scenarios:
 * 1. Building files specified in rollup.config.js
 * 2. Building libEs5/ files when publishing to NPM
 * 3. Building libEs6/ files when publishing to NPM
 * 4. Testcafe compiling clientFunctions. Unfortunately, there is no configuration I've found
 *    to tell Testcafe not to use this file.
 *
 * Environments:
 * "rollup" - Used for rollup.config.js
 * "npmEs5" - Used for building libEs5 files when publishing to NPM
 * "npmEs6" - Used for building libEs6 files when publishing to NPM
 */

const targets = {
  browsers: [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions"
  ]
};

const transformTemplateLiteralsPlugin = [
  "@babel/plugin-transform-template-literals",
  {
    loose: true
  }
];
const versionPlugin = "version";
const transformModulesCommonjsPlugin = [
  "@babel/plugin-transform-modules-commonjs",
  {
    strict: true,
    noInterop: true
  }
];

const npmIgnoreFiles = ["src/baseCode.js", "src/standalone.js"];

module.exports = {
  env: {
    rollup: {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            targets
          }
        ]
      ],
      plugins: [transformTemplateLiteralsPlugin, versionPlugin]
    },
    npmEs5: {
      presets: [
        [
          "@babel/preset-env",
          {
            targets
          }
        ]
      ],
      ignore: npmIgnoreFiles,
      plugins: [
        transformTemplateLiteralsPlugin,
        versionPlugin,
        transformModulesCommonjsPlugin
      ]
    },
    npmEs6: {
      ignore: npmIgnoreFiles,
      plugins: [versionPlugin]
    }
  }
};
