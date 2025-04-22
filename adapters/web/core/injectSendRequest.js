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
const COLLECT_REGEX = /collect\?/;

export default ({ fetch, sendBeacon, logger }) => {

  const sendWithFetch = (url, body) => {
    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      credentials: "include", // To set the cookie header in the request.
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
      },
      referrerPolicy: "no-referrer-when-downgrade",
      body,
    }).then((response) => {
      return response.text().then((responseBody) => ({
        statusCode: response.status,
        // We expose headers through a function instead of creating an object
        // with all the headers up front largely because the native
        // request.getResponseHeader method is case-insensitive.
        getHeader(name) {
          return response.headers.get(name);
        },
        body: responseBody,
      }));
    });
  };

  const sendWithSendBeacon = (url, body) => {
    const blob = new Blob([body], { type: "text/plain; charset=UTF-8" });
    if (!sendBeacon(url, blob)) {
      logger.info("Unable to use `sendBeacon`; falling back to `fetch`.");
      return sendWithFetch(url, body);
    }

    // Using sendBeacon, we technically don't get a response back from
    // the server, but we'll resolve the promise with an object to maintain
    // consistency with other network strategies.
    return Promise.resolve({
      statusCode: 204,
      getHeader() {
        return null;
      },
      body: "",
    });
  };

  return (url, body) => {
    return COLLECT_REGEX.test(url) ? sendWithSendBeacon(url, body) : sendWithFetch(url, body);
  };
};
