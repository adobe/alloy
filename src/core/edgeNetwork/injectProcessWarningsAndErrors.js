/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { NO_CONTENT } from "../../constants/httpStatusCode";
import jsonStringify from "../../utils/JSON.stringify";

const MESSAGE_PREFIX = "The server responded with a";

export default ({ logger }) => {
  return networkResponse => {
    const { statusCode, body, parsedBody } = networkResponse;

    if (
      statusCode < 200 ||
      statusCode >= 300 ||
      (!parsedBody && statusCode !== NO_CONTENT) ||
      (parsedBody && !Array.isArray(parsedBody.handle))
    ) {
      const bodyToLog = parsedBody ? jsonStringify(parsedBody, null, 2) : body;
      const messageSuffix = bodyToLog
        ? `response body:\n${bodyToLog}`
        : `no response body.`;
      throw new Error(
        `${MESSAGE_PREFIX} status code ${statusCode} and ${messageSuffix}`
      );
    }

    if (parsedBody) {
      const { warnings = [], errors = [] } = parsedBody;
      warnings.forEach(warning => {
        logger.warn(`${MESSAGE_PREFIX} warning:`, warning);
      });
      errors.forEach(error => {
        logger.error(`${MESSAGE_PREFIX} non-fatal error:`, error);
      });
    }
  };
};
