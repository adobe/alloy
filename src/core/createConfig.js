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

import { assign, getNestedObject, setNestedObject, isObject } from "../utils";

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
     * Adds schema information to the existing configuration schema.
     */
    extendSchema: schemaAddition => {
      assign(cfg.schema, schemaAddition);
      return cfg.schema;
    },
    /**
     * Validates the configuration against the defined schema.
     */
    validate: (schemaObj, key) => {
      if (!schemaObj) {
        cfg.validate(cfg.schema);
        return;
      }
      const currentKey = key || "";
      const keys = Object.keys(schemaObj);
      const required = schemaObj.R;
      const defaultValue = schemaObj.D;
      const currentValue = cfg.get(currentKey);
      if (!currentValue && currentKey) {
        if (!required) {
          return;
        }
        if (!defaultValue) {
          throw new Error(`Missing configuration entry: ${currentKey}`);
        }
        cfg.set(currentKey, defaultValue);
        return;
      }
      keys.forEach(k => {
        if (k !== "R" && k !== "D" && isObject(schemaObj[k])) {
          cfg.validate(schemaObj[k], (currentKey ? `${currentKey}.` : "") + k);
        }
      });
    },
    toJSON: () => {
      const cfgCopy = {};
      assign(cfgCopy, cfg);
      cfg.forbiddenKeys.forEach(key => {
        delete cfgCopy[key];
      });
      return cfgCopy;
    },
    schema: {},
    forbiddenKeys: []
  };
  cfg.forbiddenKeys = Object.keys(cfg);
  if (config) {
    cfg.setAll(config);
  }
  return cfg;
};

export default createConfig;
