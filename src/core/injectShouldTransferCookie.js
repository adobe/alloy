/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { isNamespacedCookieName } from "../utils/index.js";
import { AT_QA_MODE, MBOX } from "../constants/legacyCookies.js";

export default ({ orgId, targetMigrationEnabled }) => name => {
  // We have a contract with the server that we will pass
  // all cookies whose names are namespaced according to the
  // logic in isNamespacedCookieName as well as any legacy
  // cookie names (so that the server can handle migrating
  // identities on websites previously using Visitor.js)
  return (
    isNamespacedCookieName(orgId, name) ||
    name === AT_QA_MODE ||
    (targetMigrationEnabled && name === MBOX)
  );
};
