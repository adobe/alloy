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
const auth = require("@adobe/jwt-auth");

/**
 * Retrieves an access token for the Adobe I/O integration used for
 * running end-to-end tests.
 * @returns {Promise<string>}
 */
module.exports = async credentials => {
  const result = await auth(credentials);
  const { access_token: accessToken } = result;
  const { orgId, clientId } = credentials;
  return {
    "x-gw-ims-org-id": orgId,
    "x-api-key": clientId,
    Authorization: `Bearer ${accessToken}`
  };
};
