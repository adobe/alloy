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

import {
  FATAL_ERROR,
  RETRYABLE_ERROR,
  SUCCESS
} from "../../constants/responseStatusType";

const STATUS_OK = 200;
const STATUS_NO_CONTENT = 204;
const STATUS_TOO_MANY_REQUESTS = 429;

export default statusCode => {
  // Although other 200 status codes are in the "successful" 2xx range,
  // they're unexpected and we might not have code in place to successfully
  // handle them (e.g., what do we do with a 205 Reset Content?)
  if (statusCode === STATUS_OK || statusCode === STATUS_NO_CONTENT) {
    return SUCCESS;
  }

  if (
    statusCode === STATUS_TOO_MANY_REQUESTS ||
    (statusCode >= 500 && statusCode < 600)
  ) {
    return RETRYABLE_ERROR;
  }

  return FATAL_ERROR;
};
