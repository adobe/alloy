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

export default ({ sendBeacon, sendFetchRequest, logger }) => {
  return (url, body) => {
    const blob = new Blob([body], { type: "text/plain; charset=UTF-8" });
    if (!sendBeacon(url, blob)) {
      logger.log("Unable to use `sendBeacon`; falling back to `fetch`.");
      return sendFetchRequest(url, body);
    }

    // Using sendBeacon, we technically don't get a response back from
    // the server, but we'll resolve the promise with an object to maintain
    // consistency with other network strategies.
    return Promise.resolve({
      status: 204,
      body: ""
    });
  };
};
