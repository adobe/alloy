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
export default {
  parse: string => {
    // Remove leading ?, #, & for some leniency so you can pass in location.search or
    // location.hash directly.
    let parsedString = string;
    if (typeof string === "string") {
      parsedString = string.trim().replace(/^[?#&]/, "");
      parsedString = decodeURIComponent(parsedString);
    }
    return Object.fromEntries(new URLSearchParams(parsedString).entries());
  },
  stringify: object =>
    new URLSearchParams(object).toString().replace("+", "%20")
};
