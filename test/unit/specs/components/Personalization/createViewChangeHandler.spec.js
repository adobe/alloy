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
  const event = {};

  const onResponse = callback => callback();
  let executeDecisions;
  let showContainers;
  let mergeDecisionsMeta;
  let collect;

  beforeEach(() => {
    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "getViewName"
    ]);
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);
    executeDecisions = jasmine.createSpy("executeDecisions");
    showContainers = jasmine.createSpy("showContainers");
    mergeDecisionsMeta = jasmine.createSpy("mergeDecisionsMeta");
    collect = jasmine.createSpy("collect");
  });

  it("should trigger executeDecisions if renderDecisions is true", () => {
    const cartViewPromise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };

    viewCache.getView.and.returnValue(cartViewPromise);
    executeDecisions.and.returnValue(cartViewPromise);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");

    const viewChangeHandler = createViewChangeHandler({
      mergeDecisionsMeta,
      collect,
      executeDecisions,
      viewCache
    });

    viewChangeHandler({
      event,
      personalizationDetails,
      onResponse
    });
    expect(executeDecisions).toHaveBeenCalledWith(CART_VIEW_DECISIONS);
    expect(mergeDecisionsMeta).toHaveBeenCalledWith(event, CART_VIEW_DECISIONS);
    expect(collect).not.toHaveBeenCalled();
  });

  it("should not trigger executeDecisions when render decisions is false", () => {
    const cartViewPromise = {
      then: callback => callback(CART_VIEW_DECISIONS)
    };
    viewCache.getView.and.returnValue(cartViewPromise);
    personalizationDetails.isRenderDecisions.and.returnValue(false);
    personalizationDetails.getViewName.and.returnValue("cart");

    const viewChangeHandler = createViewChangeHandler({
      executeDecisions,
      viewCache,
      showContainers
    });

    viewChangeHandler({
      event,
      personalizationDetails,
      onResponse
    });
    expect(executeDecisions).not.toHaveBeenCalled();
    expect(collect).not.toHaveBeenCalled();
  });

  it("at onResponse it should trigger only executeDecisions but no collect call when there are no decisions in cache", () => {
    const cartViewPromise = {
      then: callback => callback([])
    };

    viewCache.getView.and.returnValue(cartViewPromise);
    executeDecisions.and.returnValue(cartViewPromise);
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");

    const viewChangeHandler = createViewChangeHandler({
      mergeDecisionsMeta,
      collect,
      executeDecisions,
      viewCache
    });

    viewChangeHandler({
      event,
      personalizationDetails,
      onResponse
    });
    expect(executeDecisions).toHaveBeenCalledWith([]);
    expect(collect).not.toHaveBeenCalled();
  });
});
