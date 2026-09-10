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

// Refresh this long before the real ~24h expiry (Adobe's own guidance is to
// rotate at 23h), so a slow request never straddles the token's actual
// expiration.
const EXPIRY_SAFETY_MARGIN_MILLIS = 5 * 60 * 1000;

/**
 * Exchanges OAuth Server-to-Server credentials for an IMS access token,
 * caching it for reuse until shortly before it expires. Concurrent calls
 * while a fetch is already in flight share that same in-flight request
 * instead of each starting their own.
 *
 * Deliberately not tied to a single request/instance's lifetime — callers
 * that rebuild their core instance per request (e.g. Node's forRequest())
 * should create one of these once and reuse it across those rebuilds, or
 * every request would re-authenticate with IMS from scratch.
 *
 * @param {Object} params
 * @param {{ clientId: string, clientSecret: string, scopes: string[], imsHost: string }} params.edgeCredentials
 * @param {() => Date} [params.dateProvider]
 * @returns {{ getAccessToken: () => Promise<string> }}
 */
export default ({ edgeCredentials, dateProvider = () => new Date() }) => {
  /** @type {string | undefined} */
  let cachedToken;
  let expiresAt = 0;
  /** @type {Promise<string> | undefined} */
  let pendingFetch;

  const fetchNewToken = async () => {
    const { clientId, clientSecret, scopes, imsHost } = edgeCredentials;
    const body = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: scopes.join(","),
    });

    const response = await fetch(`https://${imsHost}/ims/token/v3`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to acquire an IMS access token: the server responded with a status code ${response.status} and response body: ${await response.text()}`,
      );
    }

    const { access_token: accessToken, expires_in: expiresInSeconds } =
      await response.json();
    cachedToken = accessToken;
    expiresAt =
      dateProvider().getTime() +
      expiresInSeconds * 1000 -
      EXPIRY_SAFETY_MARGIN_MILLIS;
    return cachedToken;
  };

  return {
    getAccessToken() {
      if (cachedToken && dateProvider().getTime() < expiresAt) {
        return Promise.resolve(cachedToken);
      }
      if (!pendingFetch) {
        pendingFetch = fetchNewToken().finally(() => {
          pendingFetch = undefined;
        });
      }
      return pendingFetch;
    },
  };
};
