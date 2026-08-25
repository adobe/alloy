/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// Defaults point at the shared Alloy test org/datastream used across the
// repo's integration tests. Override via env vars to point at a different
// datastream without editing source.
const {
  ALLOY_ORG_ID = "5BFE274A5F6980A50A495C08@AdobeOrg",
  ALLOY_DATASTREAM_ID = "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  ALLOY_EDGE_DOMAIN = "edge.adobedc.net",
  ALLOY_EDGE_BASE_PATH = "ee",
  ALLOY_DEBUG_ENABLED = "true",
} = process.env;

export default {
  orgId: ALLOY_ORG_ID,
  datastreamId: ALLOY_DATASTREAM_ID,
  edgeDomain: ALLOY_EDGE_DOMAIN,
  edgeBasePath: ALLOY_EDGE_BASE_PATH,
  thirdPartyCookiesEnabled: false,
  debugEnabled: ALLOY_DEBUG_ENABLED === "true",
};
