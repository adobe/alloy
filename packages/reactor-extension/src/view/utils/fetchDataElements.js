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

import fetchFromReactor from "./fetchFromReactor";
import UserReportableError from "../errors/userReportableError";

// EXTENSION_NAME will be replace with this extension's name
const DELEGATE_DESCRIPTOR_ID = "__EXTENSION_NAME__::dataElements::variable";

/**
 * Fetches variable data elements for a property, one page per call.
 *
 * Pass `minResults` to keep fetching pages until that many variable data
 * elements have accumulated — useful when you need to know whether 0, 1,
 * or 2+ variable data elements exist on the property without loading all of
 * them.
 *
 * To search by exact name across pages, use `fetchDataElementByName` instead.
 */
const fetchDataElements = async ({
  orgId,
  imsAccess,
  propertyId,
  search = "",
  page = 1,
  signal,
  minResults,
}) => {
  const allResults = [];
  let nextPage = page;
  do {
    const params = {
      "page[size]": "100",
      "page[number]": `${nextPage}`,
    };
    if (search !== "") {
      params["filter[name]"] = `CONTAINS ${search}`;
    }

    let parsedResponse;
    try {
      // eslint-disable-next-line no-await-in-loop
      parsedResponse = await fetchFromReactor({
        orgId,
        imsAccess,
        path: `/properties/${propertyId}/data_elements`,
        params: new URLSearchParams(params),
        signal,
      });
    } catch (e) {
      if (e.name === "AbortError") {
        throw e;
      }

      throw new UserReportableError("Failed to load data elements.", {
        originatingError: e,
      });
    }

    parsedResponse.parsedBody.data
      .filter(
        ({ attributes: { delegate_descriptor_id: other } }) =>
          DELEGATE_DESCRIPTOR_ID === other,
      )
      .map(({ id, attributes: { name, settings } }) => ({
        id,
        name,
        settings: JSON.parse(settings),
      }))
      .forEach((result) => allResults.push(result));

    nextPage = parsedResponse.parsedBody.meta.pagination.next_page;
  } while (
    nextPage &&
    minResults !== undefined &&
    allResults.length < minResults
  );

  return { results: allResults, nextPage };
};

export default fetchDataElements;
