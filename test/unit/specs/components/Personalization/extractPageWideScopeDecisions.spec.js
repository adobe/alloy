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
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS,
  CART_VIEW_DECISIONS
} from "./responsesMock/eventResponses";
import extractPageWideScopeDecisions from "../../../../../src/components/Personalization/extractPageWideScopeDecisions";

describe("Personalization::extractDecisions", () => {
  it("extracts page wide scope decisions and view decisions", () => {
    const decisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS.concat(
      CART_VIEW_DECISIONS
    );

    const [pageWideDecisions, viewDecisions] = extractPageWideScopeDecisions(
      decisions
    );
    expect(pageWideDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(viewDecisions).toEqual({ cart: CART_VIEW_DECISIONS });
  });

  it("extracts views decisions only", () => {
    const [pageWideDecisions, viewDecisions] = extractPageWideScopeDecisions(
      CART_VIEW_DECISIONS
    );
    expect(pageWideDecisions).toEqual([]);
    expect(viewDecisions).toEqual({ cart: CART_VIEW_DECISIONS });
  });
});
