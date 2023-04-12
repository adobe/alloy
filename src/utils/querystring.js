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

// import queryString from "@adobe/reactor-query-string";

const queryString = {
  // NOTE: This has been optimized to only include functionality that is being
  // used in the library as of right now
  parse: string => {
    const obj = {};

    if (typeof string === "string") {
      // Remove leading ?, #, & for some leniency so you can pass in location.search or
      // location.hash directly.
      let str = string.trim().replace(/^[?#&]/, "");

      // split by &
      str = str.split("&");

      // build object of key val pairs
      for (let i = 0, il = str.length; i < il; i += 1) {
        const keyVal = str[i].replace(/\+/g, "%20");
        const index = keyVal.indexOf("=");
        let key;
        let val;

        if (index >= 0) {
          key = keyVal.substr(0, index);
          val = keyVal.substr(index + 1);
        } else {
          key = keyVal;
          val = "";
        }

        key = decodeURIComponent(key);
        val = decodeURIComponent(val);

        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
          obj[key] = val;
        } else if (Array.isArray(obj[key])) {
          obj[key].push(val);
        } else {
          obj[key] = [obj[key], val];
        }
      }
    }

    return obj;
  }

  // This is not used in the alloy codebase...
  // stringify: object => {
  //   return querystring.stringify(object);
  // }
};

export default queryString;
