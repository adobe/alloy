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

import validateSyncIdentityOptions from "../../../../../src/components/Identity/validateSyncIdentityOptions";
import describeValidation from "../../../helpers/describeValidation";

describeValidation(
  "Identity:validateSyncIdentityOptions",
  validateSyncIdentityOptions,
  [
    { value: { identities: { email: { id: "example@adobe.com" } } } },
    { value: { foo: { email: { id: "example@adobe.com" } } }, error: true },
    { value: { identities: undefined }, error: true },
    { value: { identities: null }, error: true },
    { value: { identities: "foo" }, error: true },
    {
      value: { identities: { email: { id: "example@adobe.com" } }, foo: "bar" },
      error: true
    },
    { value: "in", error: true },
    { value: undefined, error: true },
    { value: null, error: true }
  ]
);
