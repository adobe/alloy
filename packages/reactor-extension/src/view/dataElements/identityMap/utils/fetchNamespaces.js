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

import fetchFromPlatform from "../../../utils/fetchFromPlatform";

export default async ({ orgId, imsAccess, sandbox }) => {
  let parsedResponse;
  const headers = {
    "x-sandbox-name": sandbox,
  };

  try {
    parsedResponse = await fetchFromPlatform({
      orgId,
      imsAccess,
      path: "/data/core/idnamespace/identities",
      headers,
    });
  } catch {
    // TODO: Should we be reporting an error instead?
    return [];
  }

  return parsedResponse.parsedBody;
};
