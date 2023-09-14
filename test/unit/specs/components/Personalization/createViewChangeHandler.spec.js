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
import { PropositionEventType } from "../../../../../src/components/Personalization/constants/propositionEventType";
import { CART_VIEW_DECISIONS } from "./responsesMock/eventResponses";


xdescribe("Personalization::createViewChangeHandler", () => {
  let mergeDecisionsMeta;
  let render;
  let viewCache;

  let personalizationDetails;
  let event;
  let onResponse;

  beforeEach(() => {
    mergeDecisionsMeta = jasmine.createSpy("mergeDecisionsMeta");
    render = jasmine.createSpy("render");
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);

    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "getViewName"
    ]);
    event = "myevent";
    onResponse = jasmine.createSpy();
  });

  const run = async () => {
    const viewChangeHandler = createViewChangeHandler({
      mergeDecisionsMeta,
      render,
      viewCache
    });
    await viewChangeHandler({
      event,
      personalizationDetails,
      onResponse
    });
    return onResponse.calls.argsFor(0)[0]();
  };

  it("should trigger render if renderDecisions is true", async () => {
    viewCache.getView.and.returnValue(
      Promise.resolve(CART_VIEW_DECISIONS.map(createProposition))
    );
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");
    render.and.returnValue(Promise.resolve("decisionMeta"));

    const result = await run();

    expect(render).toHaveBeenCalledTimes(1);
    expect(mergeDecisionsMeta).toHaveBeenCalledWith(
      "myevent",
      "decisionMeta",
      PropositionEventType.DISPLAY
    );
    expect(result.decisions).toEqual(CART_VIEW_DECISIONS);
  });
  /*
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

  it("at onResponse it should trigger collect call when no decisions in cache", () => {
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
    expect(collect).toHaveBeenCalled();
  });
  */
});
