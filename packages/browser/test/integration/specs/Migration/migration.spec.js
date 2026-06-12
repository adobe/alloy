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

// These tests require real At.js 1.x/2.x pages and live Target endpoints; skipped
// until suitable end-to-end infrastructure is available.

import { test, describe } from "../../helpers/testsSetup/extend.js";

describe("Migration (Web SDK ↔ At.js mixed-mode)", () => {
  test.skip("C8085773: Web SDK → At.js 1.x: same session ID and edge cluster (requires At.js 1.x page + real Target edge)", () => {});

  test.skip("C8085774: Web SDK → At.js 2.x: same session ID and edge cluster (requires At.js 2.x page + real Target edge)", () => {});

  test.skip("C8085775: At.js 1.x → Web SDK: same session ID and edge cluster (requires At.js 1.x start page + real Target edge)", () => {});

  test.skip("C8085776: At.js 2.x → Web SDK: same session ID and edge cluster (requires At.js 2.x start page + real Target edge)", () => {});

  test.skip("C8085777: Web SDK profile update → At.js 2.x offer fetch (requires real Target edge + cross-page navigation)", () => {});

  test.skip("C8085778: Web SDK profile update → At.js 1.x offer fetch (requires real Target edge + cross-page navigation)", () => {});

  test.skip("C8085779: At.js 1.x profile update → Web SDK proposition fetch (requires real Target edge + cross-page navigation)", () => {});

  test.skip("C8085780: At.js 2.x profile update → Web SDK proposition fetch (requires real Target edge + cross-page navigation)", () => {});
});
