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

export default XMLHttpRequest => {
  return (url, body) => {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 204) {
            resolve();
          } else if (request.status >= 200 && request.status < 300) {
            resolve(request.responseText);
          } else {
            reject(
              new Error(
                `Invalid response code ${request.status}. Response was "${request.responseText}".`
              )
            );
          }
        }
      };
      request.onloadstart = () => {
        request.responseType = "text";
      };
      request.open("POST", url, true);
      request.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
      request.withCredentials = false;
      request.onerror = reject;
      request.onabort = reject;
      request.send(body);
    });
  };
};
