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

export default ({ XMLHttpRequest }) => {
  return (url, body) => {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 0) {
            reject(new Error("Request aborted."));
          } else {
            resolve({
              statusCode: request.status,
              // We expose headers through a function instead of creating an object
              // with all the headers up front because:
              // 1. It avoids having to add header parsing code to get all headers.
              // 2. The native request.getResponseHeader method is case-insensitive.
              getHeader(name) {
                return request.getResponseHeader(name);
              },
              body: request.responseText
            });
          }
        }
      };
      request.onloadstart = () => {
        request.responseType = "text";
      };
      request.open("POST", url, true);
      request.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
      request.withCredentials = true;
      request.onerror = reject;
      request.onabort = reject;
      request.send(body);
    });
  };
};
