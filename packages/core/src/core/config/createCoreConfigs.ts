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

import {
  boolean,
  string,
  arrayOf,
  callback,
  objectOf,
} from "../../utils/validation/index.js";
import { noop, validateConfigOverride } from "../../utils/index.js";
import {
  EDGE as EDGE_DOMAIN,
  DEFAULT_IMS_HOST,
} from "../../constants/domain.js";
import EDGE_BASE_PATH from "../../constants/edgeBasePath.js";

export default () =>
  objectOf({
    debugEnabled: boolean().default(false),
    datastreamId: string().unique().required(),
    edgeDomain: string().domain().default(EDGE_DOMAIN),
    edgeBasePath: string().nonEmpty().default(EDGE_BASE_PATH),
    orgId: string().unique().required(),
    onBeforeEventSend: callback().default(noop),
    edgeConfigOverrides: validateConfigOverride,
    // Opt-in OAuth Server-to-Server credentials — when present, requests
    // use the authenticated Server API (v2) instead of v1.
    edgeCredentials: objectOf({
      clientId: string().nonEmpty().required(),
      clientSecret: string().nonEmpty().required(),
      scopes: arrayOf(string().nonEmpty()).nonEmpty().required(),
      imsHost: string().domain().default(DEFAULT_IMS_HOST),
    }),
  }).renamed("edgeConfigId", string().unique(), "datastreamId");
