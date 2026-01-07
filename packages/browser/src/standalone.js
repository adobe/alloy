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

/** @import { WindowWithAlloy, AlloyQueueItem } from './types.js' */

import { createCustomInstance } from "./index.js";
import * as optionalComponents from "@adobe/alloy-core/core/componentCreators.js";

// This file is used by rollup to create the browser version that is uploaded to cdn

const initializeStandalone = async ({ components }) => {
  // eslint-disable-next-line no-underscore-dangle
  const instanceNames = /** @type {WindowWithAlloy} */ (window).__alloyNS;
  if (!instanceNames) {
    return;
  }
  for (const name of instanceNames) {
    const instance = createCustomInstance({ name, components });
    const execute = (/** @type {AlloyQueueItem} */ item) => {
      const [resolve, reject, [commandName, options]] = item;
      return instance(commandName, options).then(resolve, reject);
    };
    const queue = window[name].q;
    queue.push = execute;
    queue.forEach(execute);
  }
};

// If you change this line, check if the custom build script is still working.
// You might need to change the babel plugin in scripts/helpers/entryPointGeneratorBabelPlugin.js.
initializeStandalone({ components: Object.values(optionalComponents) });
