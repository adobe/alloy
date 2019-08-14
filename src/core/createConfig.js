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

import { assign, getNestedObject, setNestedObject } from "../utils";

const CONFIG_DOC_URI =
  "https://launch.gitbook.io/adobe-experience-platform-web-sdk/fundamentals/configuring-the-sdk";

const createConfig = config => {
  const cfg = {
    /**
     * Assign a value to a key
     * @param {Object} Key.
     * @param {Object} Value.
     */
    set: (key, value) => {
      return setNestedObject(cfg, key, value);
    },
    /**
     * Assigns all key-value mappings in an existing config to this config
     * @param {Object} New configurations.
     */
    setAll: cfgAdd => {
      assign(cfg, cfgAdd);
    },
    /**
     * Returns value assigned to key.
     * @param {Object} Key.
     * @param {Object} Default value if no value is found.
     */
    get: (key, defaultValue) => {
      return getNestedObject(cfg, key, defaultValue);
    },
    /**
     * Returns a set of the top level keys in this config.
     */
    keySet: () => {
      const keys = Object.keys(cfg);
      cfg.forbiddenKeys.forEach(key => {
        keys.splice(keys.indexOf(key), 1);
      });
      return keys;
    },
    /**
     * Adds more validators to any existing validators.
     */
    addValidators: validators => {
      assign(cfg.validators, validators);
      return cfg.validators;
    },
    /**
     * Validates the configuration against the defined validators.
     */
    validate: () => {
      const keys = Object.keys(cfg.validators);
      const errors = keys.reduce((ac, key) => {
        const currentValue = cfg.get(key);
        const validator = cfg.validators[key];
        if (
          currentValue == null &&
          Object.prototype.hasOwnProperty.call(validator, "defaultValue")
        ) {
          cfg.set(key, validator.defaultValue);
        } else if (validator.validate) {
          const errorMessage = validator.validate(
            key,
            currentValue,
            validator.defaultValue
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
    },
    toJSON: () => {
      const cfgCopy = {};
      assign(cfgCopy, cfg);
      cfg.forbiddenKeys.forEach(key => {
        delete cfgCopy[key];
      });
      return cfgCopy;
    },
    validators: {},
    forbiddenKeys: []
  };
  cfg.forbiddenKeys = Object.keys(cfg);
  if (config) {
    cfg.setAll(config);
  }
  return cfg;
};

export default createConfig;
