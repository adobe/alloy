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

export default fetch => {
  return (url, body) => {
    return fetch(url, {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "text/plain; charset=UTF-8"
      },
      referrer: "client",
      body
    }).then(response => {
      if (response.ok) {
        if (response.status === 204) {
          return undefined;
        }
        return response.text();
      }
      throw new Error(`Bad response code: ${response.status}`);
    });
  };
};
