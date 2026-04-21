/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import once from "once";
import UserReportableError from "../errors/userReportableError";

const monitorForOriginatingErrors = once(() => {
  // UserReportableErrors are often caused by some underlying error
  // that occurred. When debugging, we want to be able to see
  // the stack trace of the underlying error. While we could
  // try to log the underlying error when the UserReportableError
  // is instantiated, at that point we don't know if the
  // UserReportableError will go unhandled or not. We only want
  // to log the underlying error if the UserReportableError is
  // unhandled.
  window.addEventListener("error", (event) => {
    const originatingErrors = [];
    let error = event.error;

    // Note that UserReportableErrors can be stacked (one UserReportableError
    // can act as an originatingError for a different UserReportableError).
    // As such, we need to make sure we log all originating errors in an order
    // that makes sense.
    while (error instanceof UserReportableError) {
      if (error.originatingError) {
        originatingErrors.unshift(event.error.originatingError);
      }
      error = error.originatingError;
    }

    originatingErrors.forEach((originatingError) => {
      console.error(
        "The subsequent UserReportableError was caused by:\n",
        originatingError,
      );
    });
  });
});

export default monitorForOriginatingErrors;
