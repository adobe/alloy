/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import chalk from "chalk";
// eslint-disable-next-line import/extensions
import formatDate from "date-fns/format";

const buildLogger =
  (logFunc, chalkFunc, dateFactory) =>
  (firstArg, ...restArgs) => {
    let newFirstArg = firstArg;
    if (typeof firstArg === "string") {
      const date = formatDate(dateFactory(), "HH:mm:ss.SSS");
      const prefix = chalk.white(`[${date}]`);
      newFirstArg = `${prefix} ${chalkFunc(firstArg)}`;
    }
    logFunc(newFirstArg, ...restArgs);
  };

const createLogger = (console, dateFactory) => {
  return {
    log: buildLogger(console.log.bind(console), (s) => s, dateFactory),
    info: buildLogger(console.info.bind(console), (s) => s, dateFactory),
    warn: buildLogger(console.warn.bind(console), chalk.yellow, dateFactory),
    error: buildLogger(console.error.bind(console), chalk.red, dateFactory),
  };
};

export default createLogger;
