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

export const corsRequest = (XMLHttpRequest, options) => {
  const { method, url, body, responseType, withCredentials } = options;
  const headers = options.headers || {};
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.onreadystatechange = () => {
      if (request.readyState === 4) {
        if (request.status === 0) {
          reject(new Error("Request aborted."));
        } else {
          resolve({
            status: request.status,
            body: request.responseText
          });
        }
      }
    };
    request.onloadstart = () => {
      request.responseType = responseType;
    };
    request.open(method, url, true);
    Object.keys(headers).map(header =>
      request.setRequestHeader(header, headers[header])
    );
    request.withCredentials = withCredentials;
    request.onerror = reject;
    request.onabort = reject;
    if (body) {
      request.send(body);
    } else {
      request.send();
    }
  });
};

export default XMLHttpRequest => {
  return (url, body) => {
    const options = {
      method: "POST",
      responseType: "text",
      withCredentials: true,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8"
      },
      url,
      body
    };
    return corsRequest(XMLHttpRequest, options);
  };
};
