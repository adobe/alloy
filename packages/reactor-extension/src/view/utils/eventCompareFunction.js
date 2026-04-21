/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import numberAwareCompareFunction from "./numberAwareCompareFunction";

const compare = new Intl.Collator().compare;

export default (a, b) => {
  if (typeof a !== "string" || typeof b !== "string") {
    return compare(a, b);
  }
  if (a.startsWith("event")) {
    if (b.startsWith("event")) {
      return numberAwareCompareFunction(a, b);
    }
    return 1;
  }
  if (b.startsWith("event")) {
    return -1;
  }
  return compare(a, b);
};
