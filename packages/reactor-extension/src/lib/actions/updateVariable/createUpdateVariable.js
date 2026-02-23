/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { deletePath } = require("../../utils/pathUtils");

module.exports =
  ({ variableStore, deepAssign }) =>
  ({ data, dataElementId, transforms, customCode }, event) => {
    const existingValue = Object.keys(transforms || {}).reduce((memo, path) => {
      const { clear } = transforms[path];
      return clear ? deletePath(memo, path) : memo;
    }, variableStore[dataElementId] || {});

    variableStore[dataElementId] = deepAssign({}, existingValue, data);

    if (customCode) {
      customCode(variableStore[dataElementId], event);
    }

    // This is a temporary fix to support the 'audienceManager' property that should be lowercased.
    // eslint-disable-next-line no-underscore-dangle
    const adobe = variableStore[dataElementId]?.__adobe || {};
    if (adobe.audienceManager) {
      adobe.audiencemanager = adobe.audienceManager;
      delete adobe.audienceManager;
    }

    return Promise.resolve();
  };
