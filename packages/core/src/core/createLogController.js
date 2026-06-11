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

export default ({
  console,
  createLogger,
  instanceName,
  getMonitors,
  storage,
}) => {
  let debugEnabled = false;
  let debugSetByUser = false;

  // Restore debug state from the previous page load in this tab.
  storage.getItem("debug").then((stored) => {
    if (stored !== null) {
      debugEnabled = stored === "true";
      debugSetByUser = true;
    }
  }).catch(() => {});

  const getDebugEnabled = () => debugEnabled;
  const setDebugEnabled = (value, { fromConfig = false } = {}) => {
    if (!fromConfig || !debugSetByUser) {
      debugEnabled = value;
    }
    if (!fromConfig) {
      debugSetByUser = true;
      const result = storage.setItem("debug", String(value));
      if (result && typeof result.then === "function") {
        result.catch(() => {});
      }
    }
  };

  return {
    setDebugEnabled,
    logger: createLogger({
      getDebugEnabled,
      context: { instanceName },
      getMonitors,
      console,
    }),
    createComponentLogger(componentName) {
      return createLogger({
        getDebugEnabled,
        context: { instanceName, componentName },
        getMonitors,
        console,
      });
    },
  };
};
