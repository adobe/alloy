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

import { isObject } from "../../utils";

export default ({
  createConsentRequestPayload,
  createConsentRequest,
  sendEdgeNetworkRequest,
  edgeConfigOverrides: globalConfigOverrides
}) => ({
  consentOptions,
  identityMap,
  edgeConfigOverrides: localConfigOverrides
}) => {
  const requestParams = {
    payload: createConsentRequestPayload()
  };
  requestParams.payload.setConsent(consentOptions);
  const { edgeConfigId: edgeConfigIdOverride } = localConfigOverrides || {};
  if (edgeConfigIdOverride) {
    requestParams.edgeConfigIdOverride = edgeConfigIdOverride;
  }
  requestParams.payload.mergeConfigOverride(globalConfigOverrides);
  requestParams.payload.mergeConfigOverride(localConfigOverrides);
  if (isObject(identityMap)) {
    Object.keys(identityMap).forEach(key => {
      identityMap[key].forEach(identity => {
        requestParams.payload.addIdentity(key, identity);
      });
    });
  }
  const request = createConsentRequest(requestParams);
  return sendEdgeNetworkRequest({
    request
  }).then(() => {
    // Don't let response data disseminate beyond this
    // point unless necessary.
  });
};
