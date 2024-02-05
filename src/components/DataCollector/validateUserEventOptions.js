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

import { string, objectOf, boolean, arrayOf } from "../../utils/validation";
import { validateConfigOverride, validateIdentityMap } from "../../utils";
/**
 * Verifies user provided event options.
 * @param {*} options The user event options to validate
 * @returns {*} Validated options
 */
export default ({ options }) => {
  const eventOptionsValidator = objectOf({
    type: string(),
    xdm: objectOf({
      eventType: string(),
      identityMap: validateIdentityMap
    }),
    data: objectOf({}),
    documentUnloading: boolean(),
    renderDecisions: boolean(),
    decisionScopes: arrayOf(string()).uniqueItems(),
    personalization: objectOf({
      decisionScopes: arrayOf(string()).uniqueItems(),
      surfaces: arrayOf(string()).uniqueItems(),
      sendDisplayEvent: boolean().default(true),
      includeRenderedPropositions: boolean().default(false),
      defaultPersonalizationEnabled: boolean(),
      decisionContext: objectOf({})
    }).default({ sendDisplayEvent: true }),
    datasetId: string(),
    mergeId: string(),
    edgeConfigOverrides: validateConfigOverride,
    initializePersonalization: boolean()
  })
    .required()
    .noUnknownFields();
  return eventOptionsValidator(options);
};
