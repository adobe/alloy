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

export default async ({ orgId, imsAccess, signal }) => {
  // There is no sandbox API for a non-admin user to fetch
  // a single sandbox. There's also no way for non-admin users
  // to query sandboxes by name or to query for the default
  // sandbox. If we ever want to support more than one page of
  // sandboxes, we'll probably want/need improved sandbox APIs.
  let parsedResponse;
  try {
    parsedResponse = await fetchFromPlatform({
      orgId,
      imsAccess,
      path: `/data/foundation/sandbox-management/`,
      signal,
    });
  } catch (e) {
    if (e.name === "AbortError") {
      throw e;
    }

    throw new UserReportableError(`Failed to load sandboxes.`, {
      originatingError: e,
    });
  }

  return {
    results: parsedResponse.parsedBody.sandboxes,
  };
};
