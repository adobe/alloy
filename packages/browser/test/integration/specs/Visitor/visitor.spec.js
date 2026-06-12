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

// Skipped: requires Visitor.js page injection and VisitorAPI MSW — not available in this harness.

import { test, describe } from "../../helpers/testsSetup/extend.js";

describe("Visitor ID migration", () => {
  test.skip(
    "C35448 - ID migration enabled: Alloy waits for Visitor to get ECID and uses that value " +
      "(skipped: requires Visitor.js injection infrastructure and VisitorAPI MSW handler)",
    // eslint-disable-next-line no-empty-function
    async () => {},
  );

  test.skip(
    "C35450 - ID migration + consent pending: when consent is given to both, " +
      "Alloy waits for Visitor ECID " +
      "(skipped: requires Visitor.js injection infrastructure and OptIn mock)",
    // eslint-disable-next-line no-empty-function
    async () => {},
  );

  test.skip(
    "C36908 - ID migration + consent pending: Visitor denied, Alloy approved — " +
      "Alloy ECID matches Visitor ECID " +
      "(skipped: requires Visitor.js injection infrastructure and OptIn mock)",
    // eslint-disable-next-line no-empty-function
    async () => {},
  );

  test.skip(
    "C36909 - ID migration disabled + consent pending: Visitor denied, Alloy approved — " +
      "Alloy goes ahead with its own ECID " +
      "(skipped: requires Visitor.js injection infrastructure and OptIn mock)",
    // eslint-disable-next-line no-empty-function
    async () => {},
  );
});
