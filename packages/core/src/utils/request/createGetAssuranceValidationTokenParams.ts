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

interface Storage {
  getItem: (key: string) => Promise<string | null | undefined>;
  setItem: (key: string, value: string) => Promise<unknown> | boolean | void;
}

export default ({
  getLocationSearch,
  storage,
}: {
  getLocationSearch: () => string;
  storage: Storage;
}) => {
  let clientId = "";

  const getSessionId = () =>
    queryString.parse(getLocationSearch())[
      ASSURANCE_VALIDATION_SESSION_URL_PARAM
    ];

  const ensureClientId = () => {
    if (clientId) {
      return;
    }
    clientId = uuid();
    storage
      .getItem(CLIENT_ID_KEY)
      .then((stored) => {
        if (stored) {
          clientId = stored;
        } else {
          const result = storage.setItem(CLIENT_ID_KEY, clientId) as
            | Promise<unknown>
            | undefined;
          if (result && typeof result.then === "function") {
            result.catch(() => {});
          }
        }
      })
      .catch(() => {});
  };

  // Start loading before the first request so it can reuse a persisted ID.
  if (getSessionId()) {
    ensureClientId();
  }

  return () => {
    const validationSessionId = getSessionId();
    if (!validationSessionId) {
      return "";
    }
    ensureClientId();
    const validationToken = `${validationSessionId}|${clientId}`;
    return `&${queryString.stringify({
      adobeAepValidationToken: validationToken,
    })}`;
  };
};
