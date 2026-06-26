/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { uuid, queryString } from "../index.js";

const ASSURANCE_VALIDATION_SESSION_URL_PARAM = "adb_validation_sessionid";
const CLIENT_ID_KEY = "clientId";

export default ({ getLocationSearch, storage }) => {
  // Start with a fresh UUID as an immediate fallback, then overwrite with the
  // persisted value once the async read resolves. Requests fired before the
  // read settles carry the fallback UUID; all subsequent requests (and all
  // requests on future page loads) use the stable persisted ID.
  let clientId = uuid();
  storage
    .getItem(CLIENT_ID_KEY)
    .then((stored) => {
      if (stored) {
        clientId = stored;
      } else {
        const result = storage.setItem(CLIENT_ID_KEY, clientId);
        if (result && typeof result.then === "function") {
          result.catch(() => {});
        }
      }
    })
    .catch(() => {});

  return () => {
    const parsedQuery = queryString.parse(getLocationSearch());
    const validationSessionId =
      parsedQuery[ASSURANCE_VALIDATION_SESSION_URL_PARAM];
    if (!validationSessionId) {
      return "";
    }
    const validationToken = `${validationSessionId}|${clientId}`;
    return `&${queryString.stringify({
      adobeAepValidationToken: validationToken,
    })}`;
  };
};
