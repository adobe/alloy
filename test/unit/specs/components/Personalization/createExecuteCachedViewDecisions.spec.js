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
  const viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
  let executeViewDecisions;
  let collect;

  beforeEach(() => {
    executeViewDecisions = jasmine.createSpy();
    collect = jasmine.createSpy();
  });

  it("executes view decisions", () => {
    viewCache.getView.and.returnValue(CART_VIEW_DECISIONS);
    const executeCachedViewDecisions = createExecuteCachedViewDecisions({
      viewCache,
      executeViewDecisions,
      collect
    });
    const viewName = "cart";
    executeCachedViewDecisions({ viewName });

    expect(viewCache.getView).toHaveBeenCalledWith(viewName);
    expect(executeViewDecisions).toHaveBeenCalledWith(CART_VIEW_DECISIONS);
  });

  it("sends a collect call when no decisions in cache for a specific view", () => {
    viewCache.getView.and.returnValue([]);
    const executeCachedViewDecisions = createExecuteCachedViewDecisions({
      viewCache,
      executeViewDecisions,
      collect
    });
    const viewName = "products";
    const xdm = { web: { webPageDetails: { viewName } } };
    executeCachedViewDecisions({ viewName });

    expect(viewCache.getView).toHaveBeenCalledWith(viewName);
    expect(executeViewDecisions).not.toHaveBeenCalled();
    expect(collect).toHaveBeenCalledWith({ meta: {}, xdm });
  });
});
