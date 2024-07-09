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

export default ({ fetch }) => {
  return (url, body) => {
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
        // request.getResponseHeader method is case-insensitive but also because it prevents
        // us from having to add header parsing logic when using XHR to make requests.
        getHeader(name) {
          return response.headers.get(name);
        },
        body: responseBody,
      }));
    });
  };
};
