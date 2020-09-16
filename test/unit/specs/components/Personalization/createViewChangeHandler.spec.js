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
import createViewChangeHandler from "../../../../../src/components/Personalization/createViewChangeHandler";
import { CART_VIEW_DECISIONS } from "./responsesMock/eventResponses";

describe("Personalization::createViewChangeHandler", () => {
  let getView;
  let executeViewDecisions;
  let collect;

  beforeEach(() => {
    executeViewDecisions = jasmine.createSpy();
    collect = jasmine.createSpy();
  });

  it("executes view decisions", () => {
    getView = jasmine.createSpy().and.returnValue(CART_VIEW_DECISIONS);
    const handleViewChange = createViewChangeHandler({
      getView,
      executeViewDecisions,
      collect
    });
    const viewName = "cart";
    handleViewChange({ viewName });

    expect(getView).toHaveBeenCalledWith(viewName);
    expect(executeViewDecisions).toHaveBeenCalledWith(CART_VIEW_DECISIONS);
  });

  it("sends a collect call when no decisions in cache for a specific view", () => {
    getView = jasmine.createSpy().and.returnValue([]);
    const handleViewChange = createViewChangeHandler({
      getView,
      executeViewDecisions,
      collect
    });
    const viewName = "products";
    const xdm = { web: { webPageDetails: { viewName } } };
    handleViewChange({ viewName });

    expect(getView).toHaveBeenCalledWith(viewName);
    expect(executeViewDecisions).not.toHaveBeenCalled();
    expect(collect).toHaveBeenCalledWith({ meta: {}, xdm });
  });
});
