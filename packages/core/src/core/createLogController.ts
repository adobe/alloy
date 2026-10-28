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

import type { Storage } from "../services/types.js";
import type { CreateLoggerOptions } from "./createLogger.js";
import type { AlloyMonitor, LogLevel, Logger } from "./types.js";

export interface CreateLogControllerOptions {
  console: Pick<Console, LogLevel>;
  createLogger: (options: CreateLoggerOptions) => Logger;
  instanceName: string;
  getMonitors: () => AlloyMonitor[];
  storage: Storage;
}

export interface LogController {
  setDebugEnabled: (value: boolean, options?: { fromConfig?: boolean }) => void;
  logger: Logger;
  createComponentLogger: (componentName: string) => Logger;
}

export default ({
  console,
  createLogger,
  instanceName,
  getMonitors,
  storage,
}: CreateLogControllerOptions): LogController => {
  let debugEnabled = false;
  let debugSetByUser = false;

  // Restore debug state from the previous page load in this tab.
  storage
    .getItem("debug")
    .then((stored) => {
      if (stored !== null && !debugSetByUser) {
        debugEnabled = stored === "true";
        debugSetByUser = true;
      }
    })
    .catch(() => {});

  const getDebugEnabled = () => debugEnabled;
  const setDebugEnabled = (
    value: boolean,
    { fromConfig = false }: { fromConfig?: boolean } = {},
  ) => {
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
    createComponentLogger(componentName: string) {
      return createLogger({
        getDebugEnabled,
        context: { instanceName, componentName },
        getMonitors,
        console,
      });
    },
  };
};
