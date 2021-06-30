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
  CART_VIEW_DECISIONS,
  REDIRECT_PAGE_WIDE_SCOPE_DECISION,
  PRODUCTS_VIEW_DECISIONS
} from "./responsesMock/eventResponses";
import groupDecisions from "../../../../../src/components/Personalization/groupDecisions";

let cartDecisions;
let productDecisions;

beforeEach(() => {
  cartDecisions = PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS.concat(
    CART_VIEW_DECISIONS
  );
  productDecisions = PAGE_WIDE_SCOPE_DECISIONS.concat(
    REDIRECT_PAGE_WIDE_SCOPE_DECISION
  ).concat(PRODUCTS_VIEW_DECISIONS);
});
describe("Personalization::decisionsExtractor", () => {
  it("extracts decisions by scope", () => {
    const {
      redirectDecisions,
      pageWideScopeDecisions,
      viewDecisions,
      formBasedComposedDecisions
    } = groupDecisions(cartDecisions);

    expect(pageWideScopeDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(viewDecisions).toEqual({ cart: CART_VIEW_DECISIONS });
    expect(formBasedComposedDecisions).toEqual([]);
    expect(redirectDecisions).toEqual([]);
  });

  it("extracts decisions", () => {
    const expectedViewDecisions = {
      products: PRODUCTS_VIEW_DECISIONS
    };
    const {
      redirectDecisions,
      pageWideScopeDecisions,
      viewDecisions,
      formBasedComposedDecisions
    } = groupDecisions(productDecisions);

    expect(formBasedComposedDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(pageWideScopeDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
    expect(redirectDecisions).toEqual(REDIRECT_PAGE_WIDE_SCOPE_DECISION);
    expect(viewDecisions).toEqual(expectedViewDecisions);
  });
  it("extracts empty when no decisions", () => {
    const decisions = [];

    const {
      redirectDecisions,
      pageWideScopeDecisions,
      viewDecisions,
      formBasedComposedDecisions
    } = groupDecisions(decisions);

    expect(formBasedComposedDecisions).toEqual([]);
    expect(pageWideScopeDecisions).toEqual([]);
    expect(redirectDecisions).toEqual([]);
    expect(viewDecisions).toEqual({});
  });
});
