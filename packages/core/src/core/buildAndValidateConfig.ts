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

import type { ObjectValidator } from "../utils/validation/types.js";
import type { ComponentCreator, Logger } from "./types.js";

/** The computed configuration. */
export interface Config {
  debugEnabled: boolean;
  [key: string]: unknown;
}

export interface BuildAndValidateConfigOptions {
  /** The user's configure options. */
  options: unknown;
  componentCreators: ComponentCreator[];
  coreConfigValidators: ObjectValidator;
  createConfig: (options: unknown) => Config;
  logger: Logger;
  setDebugEnabled: (value: boolean, options?: { fromConfig?: boolean }) => void;
}

type QueuedLogger = Logger & { flush: () => void };
type LoggerMethodName = Exclude<keyof Logger, "enabled">;

const CONFIG_DOC_URI = "https://adobe.ly/3sHh553";

const transformOptions = ({
  combinedConfigValidator,
  options,
  logger,
}: {
  combinedConfigValidator: ObjectValidator;
  options: unknown;
  logger: Logger;
}) => {
  try {
    const validator = combinedConfigValidator.noUnknownFields().required();
    return validator.call({ logger }, options);
  } catch (e) {
    throw new Error(
      `Resolve these configuration problems:\n\t - ${(e as Error).message
        .split("\n")
        .join(
          "\n\t - ",
        )}\nFor configuration documentation see: ${CONFIG_DOC_URI}`,
      { cause: e },
    );
  }
};

const buildAllOnInstanceConfiguredExtraParams = (
  config: Config,
  logger: Logger,
  componentCreators: ComponentCreator[],
) => {
  return componentCreators.reduce<Record<string, unknown>>(
    (memo, { buildOnInstanceConfiguredExtraParams }) => {
      if (buildOnInstanceConfiguredExtraParams) {
        memo = {
          ...memo,
          ...buildOnInstanceConfiguredExtraParams({ config, logger }),
        };
      }
      return memo;
    },
    {},
  );
};

const wrapLoggerInQueue = (logger: Logger): QueuedLogger => {
  const queue: { method: LoggerMethodName; args: unknown[] }[] = [];
  const queuedLogger: Partial<QueuedLogger> = {
    get enabled() {
      return logger.enabled;
    },
    flush() {
      queue.forEach(({ method, args }) =>
        // Replays the arguments the method was called with.
        (logger[method] as (...args: unknown[]) => void)(...args),
      );
    },
  };
  // Object.keys of a Logger are its member names.
  (Object.keys(logger) as (keyof Logger)[])
    .filter((key): key is LoggerMethodName => typeof logger[key] === "function")
    .forEach((method) => {
      queuedLogger[method] = (...args: unknown[]) => {
        queue.push({ method, args });
      };
    });
  // The loop above added every Logger method.
  return queuedLogger as QueuedLogger;
};

export default ({
  options,
  componentCreators,
  coreConfigValidators,
  createConfig,
  logger,
  setDebugEnabled,
}: BuildAndValidateConfigOptions): Config => {
  // We wrap the logger in a queue in case debugEnabled is set in the config
  // but we need to log something before the config is created.
  const queuedLogger = wrapLoggerInQueue(logger);
  const combinedConfigValidator = componentCreators
    .map(({ configValidators }) => configValidators)
    .filter((configValidators) => configValidators)
    .reduce<ObjectValidator>(
      (validator, configValidators) =>
        // Undefined validators are filtered out above.
        validator.concat(configValidators as ObjectValidator),
      coreConfigValidators,
    );
  const config = createConfig(
    transformOptions({
      combinedConfigValidator,
      options,
      logger: queuedLogger,
    }),
  );
  setDebugEnabled(config.debugEnabled, { fromConfig: true });
  queuedLogger.flush();

  const extraParams = buildAllOnInstanceConfiguredExtraParams(
    config,
    logger,
    componentCreators,
  );
  logger.logOnInstanceConfigured({ ...extraParams, config });
  return config;
};
