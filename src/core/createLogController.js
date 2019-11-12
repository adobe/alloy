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

  let debugEnabled = storage.session.getItem("log") === "true";
  let debugEnabledWritableFromConfig = true;

  const getDebugEnabled = () => debugEnabled;
  const setDebugEnabled = (value, { fromConfig }) => {
    if (!fromConfig || debugEnabledWritableFromConfig) {
      debugEnabled = value;
    }

    if (!fromConfig) {
      // Web storage only allows strings, so we explicitly convert to string.
      storage.session.setItem("log", value.toString());
      debugEnabledWritableFromConfig = false;
    }
  };

  if (parsedQueryString[logQueryParam] !== undefined) {
    setDebugEnabled(stringToBoolean(parsedQueryString[logQueryParam]), {
      fromConfig: false
    });
  }

  return {
    setDebugEnabled,
    logger: createLogger(console, getDebugEnabled, loggerPrefix),
    createComponentLogger(componentNamespace) {
      return createLogger(
        console,
        getDebugEnabled,
        `${loggerPrefix} [${componentNamespace}]`
      );
    }
  };
};
