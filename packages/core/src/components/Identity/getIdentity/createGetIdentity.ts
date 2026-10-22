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

import { createRequestParams } from "../../../utils/request/index.js";
import type { ComponentTools } from "../../../core/types.js";
import type {
  Override,
  Request,
  RequestPayload,
} from "../../../utils/request/types.js";

export interface GetIdentityOptions {
  namespaces?: string[];
  edgeConfigOverrides?: Override;
}

export interface CreateGetIdentityOptions {
  sendEdgeNetworkRequest: ComponentTools["sendEdgeNetworkRequest"];
  createIdentityRequestPayload: (namespaces?: string[]) => RequestPayload;
  createIdentityRequest: (params: {
    payload: RequestPayload;
    datastreamIdOverride?: string;
  }) => Request;
  globalConfigOverrides?: Override;
}

export default ({
  sendEdgeNetworkRequest,
  createIdentityRequestPayload,
  createIdentityRequest,
  globalConfigOverrides,
}: CreateGetIdentityOptions) => {
  return ({
    namespaces,
    edgeConfigOverrides: localConfigOverrides,
  }: GetIdentityOptions = {}) => {
    const requestParams = createRequestParams({
      payload: createIdentityRequestPayload(namespaces),
      globalConfigOverrides,
      localConfigOverrides,
    });
    const request = createIdentityRequest(requestParams);
    return sendEdgeNetworkRequest({
      request,
    });
  };
};
