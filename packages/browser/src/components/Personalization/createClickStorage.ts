/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type { ClickMeta, StoreClickMeta } from "./types.js";

type ClickFields = Omit<ClickMeta, "id">;

const metasToArray = (metas: Record<string, ClickFields>) => {
  return Object.keys(metas).map((key) => {
    return {
      id: key,
      ...metas[key],
    };
  });
};

export default () => {
  const clickStorage: Record<string, Record<string, ClickFields>> = {};

  const storeClickMeta: StoreClickMeta = ({
    selector,
    meta: { id, scope, scopeDetails, trackingLabel, scopeType },
  }) => {
    if (!clickStorage[selector]) {
      clickStorage[selector] = {};
    }
    // A missing id is stored under the key "undefined".
    clickStorage[selector][String(id)] = {
      scope,
      scopeDetails,
      trackingLabel,
      scopeType,
    };
  };

  const getClickSelectors = () => {
    return Object.keys(clickStorage);
  };

  const getClickMetas = (selector: string): ClickMeta[] => {
    const metas = clickStorage[selector];
    if (!metas) {
      // Only selectors that have stored metas are requested, so this is not reached.
      return {} as ClickMeta[];
    }
    return metasToArray(clickStorage[selector]);
  };
  return {
    storeClickMeta,
    getClickSelectors,
    getClickMetas,
  };
};
