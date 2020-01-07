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
import { objectOf } from "../utils/validation";

const CONFIG_DOC_URI = "https://adobe.ly/2M4ErNE";

const buildSchema = (coreConfigValidators, componentCreators) => {
  const schema = {};
  assign(schema, coreConfigValidators);
  componentCreators.forEach(createComponent => {
    const { configValidators } = createComponent;
    assign(schema, configValidators);
  });
  return schema;
};

const transformOptions = (schema, options) => {
  try {
    const validator = objectOf(schema).required();
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

export default ({
  options,
  componentCreators,
  coreConfigValidators,
  createConfig,
  logger,
  setDebugEnabled,
  setErrorsEnabled
}) => {
  const schema = buildSchema(coreConfigValidators, componentCreators);
  const config = createConfig(transformOptions(schema, options));
  setErrorsEnabled(config.errorsEnabled);
  setDebugEnabled(config.debugEnabled, { fromConfig: true });
  // toJson is expensive so we short circuit if logging is disabled
  if (logger.enabled) {
    logger.log("Computed configuration:", config);
  }
  return config;
};
