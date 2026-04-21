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

import { createElement, Fragment } from "react";

/**
 * This error class should be used to report a specific error
 * message to the user at the nearest ErrorBoundary. If an error
 * is thrown that is not a UserReportableError, the ErrorBoundary
 * will instead show a generic message.
 */
class UserReportableError extends Error {
  constructor(message, { originatingError, additionalInfoUrl } = {}) {
    let newMessage = message;
    if (originatingError instanceof UserReportableError) {
      newMessage = createElement(
        Fragment,
        null,
        message,
        " ",
        originatingError.message,
      );
      additionalInfoUrl =
        additionalInfoUrl ?? originatingError.additionalInfoUrl;
    }

    super(newMessage);
    this.originatingError = originatingError;
    this.name = "UserReportableError";
    this.message = newMessage;
    this.additionalInfoUrl = additionalInfoUrl;
  }
}

export default UserReportableError;
