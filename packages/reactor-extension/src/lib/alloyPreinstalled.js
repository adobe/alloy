/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const createCustomInstance = ({ name }) => {
  if (!window[name] || typeof window[name] !== "function") {
    throw new Error(
      `Alloy instance "${name}" was not found on the window object. ` +
        `Ensure the Alloy base code snippet or the Alloy library is loaded before the Tags library. ` +
        `The base code snippet creates a command queue that buffers calls until Alloy fully loads.`,
    );
  }

  const instance = window[name];
  return (...args) => instance(...args);
};

const components = {};

const createEventMergeId = () => {
  throw new Error(
    "createEventMergeId is not available when using a self-hosted Alloy instance. " +
      "Use the Alloy library's built-in createEventMergeId function instead.",
  );
};

export { createCustomInstance, components, createEventMergeId };
export { default as deepAssign } from "@adobe/alloy/libEs6/utils/deepAssign";
