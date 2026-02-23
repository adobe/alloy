/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { t } from "testcafe";
import { createTestIdSelector } from "../dataTestIdSelectors.mjs";

const editor = createTestIdSelector("editor");

export default {
  expectExists: async () => {
    await t
      .expect(editor.exists)
      .ok("Editor exists when it is expected to not exist.");
  },
  expectNotExists: async () => {
    await t
      .expect(editor.exists)
      .notOk("Editor does not exist when it is expected to exist.");
  },
};
