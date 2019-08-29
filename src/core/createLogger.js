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

const createLogger = (console, logController, prefix) => {
  const process = (level, ...rest) => {
    if (logController.logEnabled) {
      console[level](prefix, ...rest);
    }
  };

  return {
    get enabled() {
      return logController.logEnabled;
    },
    /**
     * Outputs a message to the web console.
     * @param {...*} arg Any argument to be logged.
     */
    log: process.bind(null, "log"),
    /**
     * Outputs informational message to the web console. In some
     * browsers a small "i" icon is displayed next to these items
     * in the web console's log.
     * @param {...*} arg Any argument to be logged.
     */
    info: process.bind(null, "info"),
    /**
     * Outputs a warning message to the web console.
     * @param {...*} arg Any argument to be logged.
     */
    warn: process.bind(null, "warn"),
    /**
     * Outputs an error message to the web console.
     * @param {...*} arg Any argument to be logged.
     */
    error: process.bind(null, "error"),
    /**
     * Creates a new logger with an additional prefix.
     * @param {String} additionalPrefix
     */
    spawn(additionalPrefix) {
      return createLogger(
        console,
        logController,
        `${prefix} ${additionalPrefix}`
      );
    }
  };
};

export default createLogger;
