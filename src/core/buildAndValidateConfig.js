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

const CONFIG_DOC_URI = "https://adobe.ly/3sHh553";

const transformOptions = (combinedConfigValidator, options) => {
  try {
    const validator = combinedConfigValidator.noUnknownFields().required();
    return validator(options);
  } catch (e) {
    throw new Error(
      `Resolve these configuration problems:\n\t - ${e.message
        .split("\n")
        .join(
          "\n\t - "
        )}\nFor configuration documentation see: ${CONFIG_DOC_URI}`
    );
  }
};

const buildAllOnInstanceConfiguredExtraParams = (
  config,
  logger,
  componentCreators
) => {
  return componentCreators.reduce(
    (memo, { buildOnInstanceConfiguredExtraParams }) => {
      if (buildOnInstanceConfiguredExtraParams) {
        assign(memo, buildOnInstanceConfiguredExtraParams({ config, logger }));
      }
      return memo;
    },
    {}
  );
};

export default ({
  options,
  componentCreators,
  coreConfigValidators,
  createConfig,
  logger,
  setDebugEnabled
}) => {
  const combinedConfigValidator = componentCreators
    .map(({ configValidators }) => configValidators)
    .filter(configValidators => configValidators)
    .reduce(
      (validator, configValidators) => validator.concat(configValidators),
      coreConfigValidators
    );
  const config = createConfig(
    transformOptions(combinedConfigValidator, options)
  );
  setDebugEnabled(config.debugEnabled, { fromConfig: true });
  // eslint-disable-next-line no-underscore-dangle
  const extraParams = buildAllOnInstanceConfiguredExtraParams(
    config,
    logger,
    componentCreators
  );
  logger.logOnInstanceConfigured({ ...extraParams, config });
  return config;
};
