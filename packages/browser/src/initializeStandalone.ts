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

import type { AlloyGlobalNamespace, AlloyQueueItem } from "./types.js";
import { createCustomInstance } from "./index.js";
import type { CreateCustomInstanceOptions } from "@adobe/alloy-core/index.js";

const initializeStandalone = ({
  components,
}: {
  components: readonly unknown[];
}) => {
  const instanceNames = window.__alloyNS;
  if (!instanceNames) {
    return;
  }
  // Instance names are dynamic, so the window is indexed as a namespace.
  const namespace = window as unknown as AlloyGlobalNamespace;
  for (const name of instanceNames) {
    const instance = createCustomInstance({
      name,
      // Each component creator is typed for its own options, which a mixed list cannot express.
      components: components as CreateCustomInstanceOptions["components"],
    });
    const execute = (item: AlloyQueueItem) => {
      const [resolve, reject, [commandName, options]] = item;
      return instance(commandName, options).then(resolve, reject);
    };
    const queue = namespace[name].q;
    // The queue's push is replaced by a function that runs commands immediately.
    queue.push = execute as unknown as typeof queue.push;
    queue.forEach(execute);
  }
};

export default initializeStandalone;
