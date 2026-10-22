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

import redactEdgeCredentials from "../utils/redactEdgeCredentials.js";
import type { AlloyMonitor, LogLevel, Logger, LoggerContext } from "./types.js";

export interface CreateLoggerOptions {
  getDebugEnabled: () => boolean;
  console: Pick<Console, LogLevel>;
  getMonitors: () => AlloyMonitor[];
  context: LoggerContext;
}

// redactEdgeCredentials passes through any value without edgeCredentials.
type Redactable = { edgeCredentials?: object } | null | undefined;

export default ({
  getDebugEnabled,
  console,
  getMonitors,
  context,
}: CreateLoggerOptions): Logger => {
  let prefix = `[${context.instanceName}]`;
  if (context.componentName) {
    prefix += ` [${context.componentName}]`;
  }

  // redactEdgeCredentials no-ops on anything without edgeCredentials, so
  // applying it here covers every call site (config, command options, ...)
  // without redacting each one individually.
  const notifyMonitors = <T extends object>(
    method: keyof AlloyMonitor,
    data: T & { config?: unknown; options?: unknown },
  ) => {
    const monitors = getMonitors();
    if (monitors.length > 0) {
      const dataWithContext = {
        ...context,
        ...data,
        // Log data is untyped; redactEdgeCredentials only reads optional edgeCredentials keys.
        config: redactEdgeCredentials(data.config as Redactable),
        options: redactEdgeCredentials(data.options as Redactable),
      };
      monitors.forEach((monitor) => {
        if (monitor[method]) {
          // Each hook gets the payload of its own log method.
          (monitor[method] as (data: unknown) => void)(dataWithContext);
        }
      });
    }
  };

  const log = (level: LogLevel, ...rest: unknown[]) => {
    const redactedRest = rest.map(
      redactEdgeCredentials as (value: unknown) => unknown,
    );
    notifyMonitors("onBeforeLog", { level, arguments: redactedRest });
    if (getDebugEnabled()) {
      console[level](prefix, ...redactedRest);
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
        data.options,
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
        data.error,
      );
    },
    logOnBeforeNetworkRequest(data) {
      notifyMonitors("onBeforeNetworkRequest", data);
      log("info", `Request ${data.requestId}: Sending request.`, data.payload);
    },
    logOnNetworkResponse(data) {
      notifyMonitors("onNetworkResponse", data);
      if (data.sentWithBeacon) {
        // sendBeacon only tells us the browser queued the request; there is
        // no server response to report.
        log(
          "info",
          `Request ${data.requestId}: Sent using sendBeacon. No response is available for sendBeacon requests. If the page navigates away, the browser keeps sending the request in the background, but its developer tools may show it as canceled.`,
        );
        return;
      }
      const messagesSuffix =
        data.parsedBody || data.body ? `response body:` : `no response body.`;
      log(
        "info",
        `Request ${data.requestId}: Received response with status code ${data.statusCode} and ${messagesSuffix}`,
        data.parsedBody || data.body,
      );
    },
    logOnNetworkError(data) {
      notifyMonitors("onNetworkError", data);
      log(
        "error",
        `Request ${data.requestId}: Network request failed.`,
        data.error,
      );
    },
    logOnContentHiding(data) {
      notifyMonitors("onContentHiding", {
        status: data.status,
      });
      log(data.logLevel, data.message);
    },
    logOnContentRendering(data) {
      notifyMonitors("onContentRendering", {
        status: data.status,
        payload: data.detail,
      });
      log(data.logLevel, data.message);
    },
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
    error: log.bind(null, "error"),
  };
};
