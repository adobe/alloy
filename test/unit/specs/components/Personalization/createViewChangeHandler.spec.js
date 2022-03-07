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
  let personalizationDetails;
  let viewCache;
  let onResponse = jasmine.createSpy();
  const executeCachedViewDecisions = jasmine.createSpy();
  beforeEach(() => {
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "getViewName"
    ]);
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
  });

  it("should trigger executeCachedViewDecisions if renderDecisions is true", () => {
    const viewChangeHandler = createViewChangeHandler({
      executeCachedViewDecisions,
      viewCache
    });
    const promise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };
    viewCache.getView.and.returnValue(promise);

    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");

    viewChangeHandler({
      personalizationDetails,
      onResponse
    });
    expect(executeCachedViewDecisions).toHaveBeenCalledWith({
      viewName: "cart",
      viewDecisions: CART_VIEW_DECISIONS
    });
  });

  it("should return cached views if renderDecisions is false", () => {
    const promise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };
    viewCache.getView.and.returnValue(promise);

    const viewChangeHandler = createViewChangeHandler({
      executeCachedViewDecisions,
      viewCache
    });
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    personalizationDetails.getViewName.and.returnValue("cart");

    onResponse = callback => {
      callback();
    };

    viewChangeHandler({
      personalizationDetails,
      onResponse
    });
    expect(viewCache.getView).toHaveBeenCalledWith("cart");
  });
});
