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

import { validateIdentityMap } from "../../../../src/utils/index.js";
import describeValidation from "../../helpers/describeValidation.js";

describeValidation("utils:validateIdentityMap", validateIdentityMap, [
  { value: { a: [{ authenticatedState: "unknown" }] }, error: true },
  { value: { a: [{ authenticatedState: "authenticated" }] } },
  { value: { a: [{ id: 123 }] }, error: true },
  { value: { a: [{ id: "123" }] } },
  { value: { a: [{ namespace: { unknown: "field" } }] }, error: true },
  { value: { a: [{ namespace: { code: "123" } }] } },
  { value: { a: [{ primary: 1 }] }, error: true },
  { value: { a: [{ primary: true }] } },
  { value: { a: [{ xid: 123 }] }, error: true },
  { value: { a: [{ xid: "123" }] } },
  { value: { a: [{ unknown: "field" }] }, error: true },
  { value: null },
  { value: undefined },
  { value: [], error: true },
  { value: { a: [] } },
  { value: { a: null }, error: true },
  { value: { a: undefined }, error: true },
  { value: { a: "string" }, error: true },
  { value: {} },
]);
