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

import { queryString, stringToBoolean } from "../utils";
import logQueryParam from "../constants/logQueryParam";

export default ({
  console,
  locationSearch,
  createLogger,
  instanceNamespace,
  createNamespacedStorage
}) => {
  const loggerPrefix = `[${instanceNamespace}]`;
  const parsedQueryString = queryString.parse(locationSearch);
  const storage = createNamespacedStorage(`instance.${instanceNamespace}.`);

  let logEnabled = storage.session.getItem("log") === "true";
  let logEnabledSetWithHighPriority = false;

  const getLogEnabled = () => logEnabled;
  const setLogEnabled = (value, { persist, highPriority }) => {
    if (highPriority) {
      logEnabledSetWithHighPriority = true;
    }

    if (highPriority || !logEnabledSetWithHighPriority) {
      // Web storage only allows strings, so we explicitly convert to string.
      if (persist) {
        storage.session.setItem("log", value.toString());
      }
      logEnabled = value;
    }
  };

  if (parsedQueryString[logQueryParam] !== undefined) {
    setLogEnabled(stringToBoolean(parsedQueryString[logQueryParam]), {
      persist: true,
      highPriority: true
    });
  }

  return {
    setLogEnabled,
    logger: createLogger(console, getLogEnabled, loggerPrefix),
    createComponentLogger(componentNamespace) {
      return createLogger(
        console,
        getLogEnabled,
        `${loggerPrefix} [${componentNamespace}]`
      );
    }
  };
};
