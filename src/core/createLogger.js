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

import { assign } from "../utils";

export default ({ getDebugEnabled, console, getMonitors, context }) => {
  let prefix = `[${context.instanceName}]`;
  if (context.componentName) {
    prefix += ` [${context.componentName}]`;
  }

  const notifyMonitors = (method, data) => {
    const monitors = getMonitors();
    if (monitors.length > 0) {
      const dataWithContext = assign({}, context, data);
      monitors.forEach(monitor => {
        if (monitor[method]) {
          monitor[method](dataWithContext);
        }
      });
    }
  };

  const log = (level, ...rest) => {
    notifyMonitors("onBeforeLog", { level, arguments: rest });
    if (getDebugEnabled()) {
      console[level](prefix, ...rest);
    }
  };

  return {
    get enabled() {
      return getMonitors().length > 0 || getDebugEnabled();
    },
    logOnInstanceCreated(data) {
      notifyMonitors("onInstanceCreated", data);
      log("info", "Instance initialized.");
    },
    logOnInstanceConfigured(data) {
      notifyMonitors("onInstanceConfigured", data);
      log("info", "Instance configured. Computed configuration:", data.config);
    },
    logOnBeforeCommand(data) {
      notifyMonitors("onBeforeCommand", data);
      log(
        "info",
        `Executing ${data.commandName} command. Options:`,
        data.options
      );
    },
    logOnCommandResolved(data) {
      notifyMonitors("onCommandResolved", data);
      log("info", `${data.commandName} command resolved. Result:`, data.result);
    },
    logOnCommandRejected(data) {
      notifyMonitors("onCommandRejected", data);
      log(
        "error",
        `${data.commandName} command was rejected. Error:`,
        data.error
      );
    },
    logOnBeforeNetworkRequest(data) {
      notifyMonitors("onBeforeNetworkRequest", data);
      log("info", `Request ${data.requestId}: Sending request.`, data.payload);
    },
    logOnNetworkResponse(data) {
      notifyMonitors("onNetworkResponse", data);
      const messagesSuffix =
        data.parsedBody || data.body ? `response body:` : `no response body.`;
      log(
        "info",
        `Request ${data.requestId}: Received response with status code ${data.statusCode} and ${messagesSuffix}`,
        data.parsedBody || data.body
      );
    },
    logOnNetworkError(data) {
      notifyMonitors("onNetworkError", data);
      log(
        "error",
        `Request ${data.requestId}: Network request failed.`,
        data.error
      );
    },
    /**
     * Outputs a message to the web console.
     * @param {...*} arg Any argument to be logged.
     */
    log: log.bind(null, "log"),
    /**
     * Outputs informational message to the web console. In some
     * browsers a small "i" icon is displayed next to these items
     * in the web console's log.
     * @param {...*} arg Any argument to be logged.
     */
    info: log.bind(null, "info"),
    /**
     * Outputs a warning message to the web console.
     * @param {...*} arg Any argument to be logged.
     */
    warn: log.bind(null, "warn"),
    /**
     * Outputs an error message to the web console.
     * @param {...*} arg Any argument to be logged.
     */
    error: log.bind(null, "error")
  };
};
