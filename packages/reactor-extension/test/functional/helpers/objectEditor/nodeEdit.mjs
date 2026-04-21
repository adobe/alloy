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
import {
  createTestIdSelector,
  createTestIdSelectorString,
} from "../dataTestIdSelectors.mjs";

const nodeEdit = createTestIdSelector("nodeEdit");
const heading = createTestIdSelector("heading");

export default {
  breadcrumb: {
    item: (label) => {
      const node = nodeEdit
        .find(createTestIdSelectorString("breadcrumb"))
        .find('[role="link"]')
        .withExactText(label);
      return {
        click: async () => {
          return t.click(node);
        },
      };
    },
  },
  heading: {
    expectText: async (text) => {
      return t.expect(heading.withExactText(text).exists).ok();
    },
  },
};
