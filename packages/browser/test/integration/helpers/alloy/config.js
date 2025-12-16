/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default {
  orgId: import.meta.env.VITE_ORG_ID || "5BFE274A5F6980A50A495C08@AdobeOrg",
  datastreamId:
    import.meta.env.VITE_DATASTREAM_ID ||
    "bc1a10e0-aee4-4e0e-ac5b-cdbb9abbec83",
  edgeDomain: import.meta.env.VITE_EDGE_DOMAIN || "edge.adobedc.net",
  edgeBasePath: import.meta.env.VITE_EDGE_BASE_PATH || "ee",
  thirdPartyCookiesEnabled: false,
};
