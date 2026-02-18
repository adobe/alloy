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

const CLIENT_SECRET_ENV_VAR_NAME = "EDGE_E2E_CLIENT_SECRET";
const ORG_ID_ENV_VAR_NAME = "EDGE_E2E_ORG_ID";
const CLIENT_ID_ENV_VAR_NAME = "EDGE_E2E_CLIENT_ID";

const clientSecret = process.env[CLIENT_SECRET_ENV_VAR_NAME];
const orgId =
  process.env[ORG_ID_ENV_VAR_NAME] || "5BFE274A5F6980A50A495C08@AdobeOrg";
const clientId =
  process.env[CLIENT_ID_ENV_VAR_NAME] || "0c1c7478c4994c69866b64c8341578ed";

let credentials = {};

if (clientSecret) {
  credentials = {
    clientId,
    clientSecret,
    orgId,
  };
} else {
  // eslint-disable-next-line no-console
  console.error(
    `Unable to obtain access. Please ensure that ${CLIENT_SECRET_ENV_VAR_NAME} is set.`,
  );
}

export default credentials;
