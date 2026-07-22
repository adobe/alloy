/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import setupBaseCode from "./setupBaseCode.js";
import setupAlloy from "./setup.js";
import cleanAlloy from "./clean.js";

// Simulates a page reload: clears in-memory Alloy state (cookies persist) and
// re-injects the base code + Alloy library, returning the fresh instance. To
// simulate a reload with a missing cookie, delete it before calling this.
export default async () => {
  cleanAlloy();
  await setupBaseCode();
  return setupAlloy();
};
