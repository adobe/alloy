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

import fetchDataElements from "./fetchDataElements";

/**
 * Searches pages of variable-type data elements for one whose name matches
 * `name` exactly, stopping as soon as the match is found.
 *
 * @param {object} options
 * @param {string} options.orgId - IMS organization ID.
 * @param {string} options.imsAccess - IMS access token.
 * @param {string} options.propertyId - Reactor property ID to scope the request.
 * @param {string} options.name - Exact data element name to find.
 * @param {AbortSignal} [options.signal] - Signal used to abort the request.
 * @returns {Promise<{id: string, name: string, settings: object}|undefined>}
 *   The matching data element, or `undefined` if none exists in the property.
 */
const fetchDataElementByName = async ({
  orgId,
  imsAccess,
  propertyId,
  name,
  signal,
}) => {
  let page = 1;
  do {
    // eslint-disable-next-line no-await-in-loop
    const { results, nextPage } = await fetchDataElements({
      orgId,
      imsAccess,
      propertyId,
      search: name,
      page,
      signal,
    });
    const match = results.find((de) => de.name === name);
    if (match) return match;
    page = nextPage;
  } while (page);
  return undefined;
};

export default fetchDataElementByName;
