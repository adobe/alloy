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

import {
  ACTIVITY_COLLECTOR,
  allComponents,
  AUDIENCES,
  CONTEXT,
  DATA_COLLECTOR,
  EVENT_MERGE,
  IDENTITY,
  LIBRARY_INFO,
  MACHINE_LEARNING,
  PERSONALIZATION,
  PRIVACY
} from "../constants/componentNames";

// 65% confidence on the following:
// The string path parameter inside import() needs to be a value(aka not a variable)
// so that it can correctly get picked up the bundler and tree shaker. Likewise,
// the import() needs to bare and not wrapped in a function because it is not a
// function per-se, so it cannot be manipulated like a function without it failing
// to be optimized by the bundler/tree-shaker.
export default (enabledComponents = allComponents) => {
  const enabledComponentsSet = new Set(enabledComponents);
  const componentCreators = [];
  if (enabledComponentsSet.has(ACTIVITY_COLLECTOR)) {
    componentCreators.push(
      import("../components/ActivityCollector").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(AUDIENCES)) {
    componentCreators.push(
      import("../components/Audiences").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(CONTEXT)) {
    componentCreators.push(
      import("../components/Context").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(DATA_COLLECTOR)) {
    componentCreators.push(
      import("../components/DataCollector").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(EVENT_MERGE)) {
    componentCreators.push(
      import("../components/EventMerge").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(IDENTITY)) {
    componentCreators.push(
      import("../components/Identity").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(LIBRARY_INFO)) {
    componentCreators.push(
      import("../components/LibraryInfo").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(MACHINE_LEARNING)) {
    componentCreators.push(
      import("../components/MachineLearning").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(PERSONALIZATION)) {
    componentCreators.push(
      import("../components/Personalization").then(module => module.default)
    );
  }
  if (enabledComponentsSet.has(PRIVACY)) {
    componentCreators.push(
      import("../components/Privacy").then(module => module.default)
    );
  }

  return componentCreators;
};
