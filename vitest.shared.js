/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/**
 * Makes Vite resolve `@adobe/alloy-core` to its source (the `alloy-source` export
 * condition) instead of its build output, so core never has to be built first.
 * The remaining conditions are Vite's defaults.
 */
export const sourceConditionResolve = {
  resolve: {
    conditions: ["alloy-source", "module", "browser", "development|production"],
  },
  ssr: {
    resolve: {
      conditions: ["alloy-source", "module", "node", "development|production"],
    },
  },
};
