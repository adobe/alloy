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

import { assign, createMerger } from "../../../utils";

/**
 * Creates a payload object that extends a base payload object. This is not
 * intended to be used from any modules other than "extending" payload modules.
 * @param {Function} construct A function that which will receive the content object
 * that the "subclass" can modify. The content object will be serialized when toJSON()
 * is called. The construct method should return an object whose methods will be merged on
 * on top of the methods of the base payload object.
 * @returns {Object} The extended payload object.
 */
export default construct => {
  const content = {};
  let useIdThirdPartyDomain = false;

  const basePayload = {
    mergeConfigOverrides: createMerger(content, "meta.configOverrides"),
    mergeState: createMerger(content, "meta.state"),
    useIdThirdPartyDomain() {
      useIdThirdPartyDomain = true;
    },
    getUseIdThirdPartyDomain() {
      return useIdThirdPartyDomain;
    },
    expectResponse() {},
    toJSON() {
      return content;
    }
  };

  const extendedPayload = construct(content);
  return assign({}, basePayload, extendedPayload);
};
