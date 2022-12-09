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

// TODO: Register the Components here statically for now. They might be registered differently.
// TODO: Figure out how sub-components will be made available/registered
// returns an array of functions that return a promise that resolves to a function
export default () => {
  return [
    import("../components/DataCollector").then(module => module.default),
    import("../components/ActivityCollector").then(module => module.default),
    import("../components/Identity").then(module => module.default),
    import("../components/Audiences").then(module => module.default),
    import("../components/Personalization").then(module => module.default),
    import("../components/Context").then(module => module.default),
    import("../components/Privacy").then(module => module.default),
    import("../components/EventMerge").then(module => module.default),
    import("../components/LibraryInfo").then(module => module.default),
    import("../components/MachineLearning").then(module => module.default)
  ];
};
