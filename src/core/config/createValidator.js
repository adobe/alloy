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

import { assign } from "../../utils";

const CONFIG_DOC_URI =
  "https://launch.gitbook.io/adobe-experience-platform-web-sdk/fundamentals/configuring-the-sdk";

const createConfigValidator = config => {
  const validators = Object.create(null);

  const validator = {
    addValidators(newValidators) {
      return assign(validators, newValidators);
    },
    validate() {
      const executeValidator = (validate, key, errors) => {
        const { defaultValue } = validators[key];
        const errorMessage = validate(key, config[key], defaultValue);

        if (errorMessage) {
          errors.push(errorMessage);
        }
      };

      const errors = Object.keys(validators).reduce((ac, key) => {
        const configValue = config[key];
        const isConfigValueProvided = configValue !== undefined;
        const configValidator = validators[key];
        const hasDefault = configValidator.defaultValue !== undefined;

        // 1: If no value provided, but there's a default, set default in config.
        // TODO: It's weird that the validator sets defaults as well. This should happen
        // when creating the config instead. Maybe pass `options` & `configValidators` to
        // createConfig.
        if (!isConfigValueProvided && hasDefault) {
          config[key] = configValidator.defaultValue;
        }

        // 2: Validate.
        if (configValidator.isRequired) {
          if (!isConfigValueProvided) {
            ac.push(`${key} is required.`);
          } else if (configValidator.validate) {
            executeValidator(configValidator.validate, key, ac);
          }
        } else if (isConfigValueProvided && configValidator.validate) {
          executeValidator(configValidator.validate, key, ac);
        }

        return ac;
      }, []);

      if (errors.length) {
        throw new Error(
          `Resolve these configuration problems:\n\t - ${errors.join(
            "\n\t - "
          )}\nFor configuration documentation see: ${CONFIG_DOC_URI}`
        );
      }
    }
  };

  return validator;
};

export default createConfigValidator;
