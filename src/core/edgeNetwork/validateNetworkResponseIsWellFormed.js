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

import { NO_CONTENT } from "../../constants/httpStatusCode";

/**
 * Ensures that the edge network response is well-formed, or in other words,
 * something that we expect in a successful round-trip to the edge.
 */
export default networkResponse => {
  const { statusCode, body, parsedBody } = networkResponse;
  if (
    (!parsedBody && statusCode !== NO_CONTENT) ||
    (parsedBody && !Array.isArray(parsedBody.handle))
  ) {
    const messageSuffix = body ? `response body: ${body}` : `no response body.`;
    throw new Error(
      `Unexpected server response with status code ${statusCode} and ${messageSuffix}`
    );
  }
};
