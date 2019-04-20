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

const createConfig = config => {
  const cfg = {
    /**
     * Assign a value to a key
     * @param {Object} Key.
     * @param {Object} Value.
     */
    put: (key, value) => {
      let keys = [key];
      if (typeof key === "string") {
        keys = key.split(".");
      }
      let obj = cfg;
      let existingValue;
      for (let i = 0; i < keys.length; i += 1) {
        if (i === keys.length - 1) {
          existingValue = obj[keys[i]];
          obj[keys[i]] = value;
        } else if (!obj[keys[i]]) {
          obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
      }
      return existingValue;
    },
    /**
     * Assigns all key-value mappings in an existing config to this config
     * @param {Object} New configurations.
     */
    putAll: cfgAdd => {
      Object.assign(cfg, cfgAdd);
    },
    /**
     * Returns value assigned to key.
     * @param {Object} Key.
     * @param {Object} Default value if no value is found.
     */
    get: (key, defaultValue) => {
      let keys = [key];
      if (typeof key === "string") {
        keys = key.split(".");
      }
      let obj = cfg;
      for (let i = 0; i < keys.length; i += 1) {
        if (!obj || !Object.prototype.hasOwnProperty.call(obj, keys[i])) {
          return defaultValue;
        }
        obj = obj[keys[i]];
      }
      return obj;
    },
    /**
     * Returns a set of the top level keys in this config.
     */
    keySet: () => {
      const keys = new Set(Object.keys(cfg));
      cfg.forbiddenKeys.forEach(key => {
        keys.delete(key);
      });
      return keys;
    },
    /**
     * Adds schema information to the existing configuration schema.
     */
    extendSchema: schemaAddition => {
      if (schemaAddition && typeof schemaAddition !== "object") {
        Object.assign(cfg.schema, schemaAddition);
      }
      return cfg.schema;
    },
    /**
     * Validates the configuration against the defined schema.
     */
    validate: () => {
      // TODO: Validate existing configuration against defined schema.
      return true;
    },
    toJSON: () => {
      const cfgCopy = {};
      Object.assign(cfgCopy, cfg);
      cfg.forbiddenKeys.forEach(key => {
        delete cfgCopy[key];
      });
      return cfgCopy;
    },
    schema: {},
    forbiddenKeys: {}
  };
  cfg.forbiddenKeys = new Set(Object.keys(cfg));
  if (config && typeof config === "object") {
    cfg.putAll(config);
  }
  return cfg;
};

export default createConfig;
