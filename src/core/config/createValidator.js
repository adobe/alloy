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

const CONFIG_DOC_URI = "https://adobe.ly/2M4ErNE";

const createConfigValidator = config => {
  const validators = Object.create({});

  const validator = {
    addValidators(newValidators) {
      return assign(validators, newValidators);
    },
    validate() {
      const errors = Object.keys(validators).reduce((ac, key) => {
        const configValue = config[key];
        const isConfigValueProvided = configValue != null;
        const configValidator = validators[key];
        const hasDefault = configValidator.defaultValue !== undefined;

        if (!isConfigValueProvided && hasDefault) {
          // no need to validate the defaultValue
          config[key] = configValidator.defaultValue;
        } else if (
          (isConfigValueProvided || configValidator.isRequired) &&
          configValidator.validate
        ) {
          // We need to validate if the value was provided by the user,
          // but also if there was no value provided and this config is required,
          // the validator will give an error message.
          const errorMessage = configValidator.validate(
            key,
            configValue,
            configValidator.defaultValue
          );

          if (errorMessage) {
            ac.push(errorMessage);
          }
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
