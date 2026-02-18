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

import fetchFromEdge from "../../utils/fetchFromEdge";
import UserReportableError from "../../errors/userReportableError";

const fetchConfigs = async ({
  orgId,
  imsAccess,
  search,
  start,
  limit,
  signal,
  sandbox,
}) => {
  const params = new URLSearchParams();
  params.append("orderby", "title");

  if (search) {
    params.append("property", `title:${search}`);
  }

  if (start) {
    params.append("start", start);
  }

  if (limit) {
    params.append("limit", limit);
  }

  let parsedResponse;
  const headers = {
    "x-sandbox-name": sandbox,
  };

  try {
    parsedResponse = await fetchFromEdge({
      orgId,
      imsAccess,
      path: "/metadata/namespaces/edge/datasets/datastreams/records/",
      params,
      headers,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }

    throw new UserReportableError("Failed to load datastreams.", {
      originatingError: e,
    });
  }

  const {
    parsedBody: { _embedded, _links },
  } = parsedResponse;

  return {
    results: _embedded?.records ?? [],
    // parsedBody.page won't exist if there were 0 results
    nextPage: _links && _links.next ? _links.next.href : null,
  };
};

export default fetchConfigs;
