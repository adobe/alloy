/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import computeConsentHash from "./computeConsentHash";

const getKey = ({ standard, version }) => {
  return `${standard}.${version}`;
};

export default ({ storage }) => {
  return {
    clear() {
      storage.clear();
    },
    lookup(consentObjects) {
      const currentHashes = {};
      const getCurrentHash = consentObject => {
        const key = getKey(consentObject);
        const { standard, version, ...rest } = consentObject;
        if (!currentHashes[key]) {
          currentHashes[key] = computeConsentHash(rest).toString();
        }
        return currentHashes[key];
      };

      return {
        isNew() {
          return consentObjects.some(consentObject => {
            const key = getKey(consentObject);
            const previousHash = storage.getItem(key);
            return (
              previousHash === null ||
              previousHash !== getCurrentHash(consentObject)
            );
          });
        },
        save() {
          consentObjects.forEach(consentObject => {
            const key = getKey(consentObject);
            storage.setItem(key, getCurrentHash(consentObject));
          });
        }
      };
    }
  };
};
