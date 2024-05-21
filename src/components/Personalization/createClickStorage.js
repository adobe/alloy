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

const metasToArray = (metas) => {
  return Object.keys(metas).map((key) => {
    return {
      id: key,
      ...metas[key],
    };
  });
};

export default () => {
  const clickStorage = {};

  const storeClickMetrics = ({
    selector,
    meta: { id, scope, scopeDetails, trackingLabel, scopeType },
  }) => {
    if (!clickStorage[selector]) {
      clickStorage[selector] = {};
    }
    clickStorage[selector][id] = {
      scope,
      scopeDetails,
      trackingLabel,
      scopeType,
    };
  };

  const getClickSelectors = () => {
    return Object.keys(clickStorage);
  };

  const getClickMetasBySelector = (selector) => {
    const metas = clickStorage[selector];
    if (!metas) {
      return {};
    }
    return metasToArray(clickStorage[selector]);
  };
  return {
    storeClickMetrics,
    getClickSelectors,
    getClickMetasBySelector,
  };
};
