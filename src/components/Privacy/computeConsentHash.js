/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import objectKeys from "../../utils/Object.keys";
import jsonStringify from "../../utils/JSON.stringify";
import { crc32 } from "../../utils";

// serialize an object with a consistent ordering
const serialize = obj => {
  if (Array.isArray(obj)) {
    return obj.map(i => serialize(i));
  }
  if (typeof obj === "object" && obj !== null) {
    return objectKeys(obj)
      .sort()
      .reduce((memo, key) => {
        memo[key] = serialize(obj[key]);
        return memo;
      }, {});
  }
  return obj;
};

export default obj => {
  return crc32(jsonStringify(serialize(obj)));
};
