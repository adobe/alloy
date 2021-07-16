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
import createExecuteCachedViewDecisions from "../../../../../src/components/Personalization/createExecuteCachedViewDecisions";
import { CART_VIEW_DECISIONS } from "./responsesMock/eventResponses";

describe("Personalization::createExecuteCachedViewDecisions", () => {
  let executeViewDecisions;
  let collect;
  let cartViewDecisions;

  beforeEach(() => {
    executeViewDecisions = jasmine.createSpy("executeViewDecisions");
    collect = jasmine.createSpy();
    cartViewDecisions = [...CART_VIEW_DECISIONS];
  });

  it("executes view decisions", () => {
    const executeCachedViewDecisions = createExecuteCachedViewDecisions({
      executeViewDecisions,
      collect
    });
    const viewName = "cart";
    executeCachedViewDecisions({
      viewName,
      viewDecisions: cartViewDecisions
    });
    expect(executeViewDecisions).toHaveBeenCalledWith(cartViewDecisions);
  });

  it("sends a collect call when no decisions in cache for a specific view", () => {
    const executeCachedViewDecisions = createExecuteCachedViewDecisions({
      executeViewDecisions,
      collect
    });
    const viewName = "products";
    const xdm = { web: { webPageDetails: { viewName } } };
    executeCachedViewDecisions({ viewName, viewDecisions: [] });

    expect(executeViewDecisions).not.toHaveBeenCalled();
    expect(collect).toHaveBeenCalledWith({ decisionsMeta: [], xdm });
  });
});
