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

// TO-DOCUMENT: Lifecycle hooks and their params.
const hookNames = [
  "onComponentsRegistered",
  "onBeforeEvent",
  "onResponse",
  "onResponseError",
  "onBeforeDataCollection"
];

const createHook = (componentRegistry, hookName) => {
  return (...args) => {
    return Promise.all(
      componentRegistry.getLifecycleCallbacks(hookName).map(callback => {
        return new Promise(resolve => {
          resolve(callback(...args));
        });
      })
    ).then(() => {
      // Prevent potential callback return values from being exposed beyond
      // this point. Return values from callbacks shouldn't be relied on.
    });
  };
};

/**
 * This ensures that if a component's lifecycle method X
 * attempts to execute lifecycle method Y, that all X methods on all components
 * will have been called before any of their Y methods are called. It does
 * this by kicking the call to the Y method to the next JavaScript tick.
 * @returns {function}
 */
const guardHook = fn => {
  return (...args) => {
    return Promise.resolve().then(() => {
      return fn(...args);
    });
  };
};

export default componentRegistry => {
  return hookNames.reduce((memo, hookName) => {
    memo[hookName] = guardHook(createHook(componentRegistry, hookName));
    return memo;
  }, {});
};
