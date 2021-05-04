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

import {
  PAGE_WIDE_SCOPE_DECISIONS,
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
  PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS,
  CART_VIEW_DECISIONS
} from "./responsesMock/eventResponses";
import decisionsExtractor from "../../../../../src/components/Personalization/decisionsExtractor";
import { DOM_ACTION } from "../../../../../src/components/Personalization/constants/schema";

describe("Personalization::decisionsExtractor", () => {
  it("extracts decisions by scope", () => {
    const decisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS.concat(
      CART_VIEW_DECISIONS
    );

    const {
      pageWideScopeDecisions,
      nonPageWideScopeDecisions
    } = decisionsExtractor.groupDecisionsByScope({
      decisions,
      scope: "__view__"
    });
    expect(pageWideScopeDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(nonPageWideScopeDecisions).toEqual({ cart: CART_VIEW_DECISIONS });
  });

  it("extracts decisions by schema", () => {
    const decisions = PAGE_WIDE_SCOPE_DECISIONS;

    const {
      matchedDecisions,
      notMatchedDecisions
    } = decisionsExtractor.groupDecisionsBySchema({
      decisions,
      schema: DOM_ACTION
    });
    expect(notMatchedDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(matchedDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
  });
});
