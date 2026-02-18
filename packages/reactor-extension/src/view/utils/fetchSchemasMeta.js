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

import escapeStringRegexp from "escape-string-regexp";
import fetchFromPlatform from "./fetchFromPlatform";
import UserReportableError from "../errors/userReportableError";

const metaClass = encodeURIComponent(
  "https://ns.adobe.com/xdm/context/experienceevent",
);

export default async ({
  orgId,
  imsAccess,
  sandboxName,
  search,
  limit,
  start,
  signal,
}) => {
  const path = `/data/foundation/schemaregistry/tenant/schemas`;

  const params = new URLSearchParams();
  // Ordering makes this run super slow!
  // params.append("orderby", "title");
  params.append("property", `meta:class==${metaClass}`);

  if (search) {
    // We escape regex special characters because ~ in the querystring
    // searches by regex and we don't want to search by regex.
    params.append("property", `title~${escapeStringRegexp(search)}`);
  }

  if (start) {
    params.append("start", start);
  }

  if (limit) {
    params.append("limit", limit);
  }

  const headers = {
    // request a summary response with title , $id , meta:altId , and version attributes
    Accept: "application/vnd.adobe.xed-id+json",
    "x-sandbox-name": sandboxName,
  };

  let parsedResponse;
  try {
    parsedResponse = await fetchFromPlatform({
      orgId,
      imsAccess,
      path,
      params,
      headers,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }
    throw new UserReportableError("Failed to load schema metadata.", {
      originatingError: e,
    });
  }

  return {
    results: parsedResponse.parsedBody.results,
    // eslint-disable-next-line no-underscore-dangle
    nextPage: parsedResponse.parsedBody._page.next,
  };
};
