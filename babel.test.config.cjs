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
 * This file is used for building files specified in rollup.test.config.js as part of unit tests
 *
 * Environments:
 * "rollup" - Used for rollup.test.config.js
 */
const targets = {
  browsers: [
    "last 2 Chrome versions",
    "last 2 Firefox versions",
    "last 2 Safari versions",
    "last 2 Edge versions",
  ],
};

const transformRuntime = ["@babel/transform-runtime"];
const transformTemplateLiteralsPlugin = [
  "@babel/plugin-transform-template-literals",
  {
    loose: true,
  },
];

module.exports = {
  env: {
    rollup: {
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            targets,
          },
        ],
      ],
      plugins: [transformRuntime, transformTemplateLiteralsPlugin],
    },
  },
};
