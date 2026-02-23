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

import fetchFromPlatform from "./fetchFromPlatform";
import UserReportableError from "../errors/userReportableError";

export default async ({
  orgId,
  imsAccess,
  schemaId,
  schemaVersion,
  sandboxName,
  signal,
}) => {
  const schemaMajorVersion = schemaVersion.split(".")[0];
  const path = `/data/foundation/schemaregistry/tenant/schemas/${encodeURIComponent(
    schemaId,
  )}`;

  const headers = {
    // request a summary response with title , $id , meta:altId , and version attributes
    Accept: `application/vnd.adobe.xed-full+json;version=${schemaMajorVersion}`,
    "x-sandbox-name": sandboxName,
  };

  let parsedResponse;
  try {
    parsedResponse = await fetchFromPlatform({
      orgId,
      imsAccess,
      path,
      headers,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }

    throw new UserReportableError("Failed to load schema.", {
      originatingError: e,
    });
  }

  return parsedResponse.parsedBody;
};
