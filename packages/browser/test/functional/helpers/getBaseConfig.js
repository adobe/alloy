/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import DATASTREAM_ID from "./constants/datastreamId.js";
import edgeDomainThirdParty from "./constants/configParts/edgeDomainThirdParty.js";

const edgeBasePath = process.env.EDGE_BASE_PATH;

export default (orgId, configId = DATASTREAM_ID) => {
  const config = {
    datastreamId: configId,
    orgId: orgId || "5BFE274A5F6980A50A495C08@AdobeOrg",
    // Default `edgeDomain` to 3rd party; override in specific test if needed.
    ...edgeDomainThirdParty,
  };

  if (edgeBasePath) {
    config.edgeBasePath = edgeBasePath;
  }

  return config;
};
