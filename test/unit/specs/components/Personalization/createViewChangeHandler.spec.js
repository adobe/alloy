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

import createViewChangeHandler from "../../../../../src/components/Personalization/createViewChangeHandler.js";
import { CART_VIEW_DECISIONS } from "./responsesMock/eventResponses.js";
import injectCreateProposition from "../../../../../src/components/Personalization/handlers/injectCreateProposition.js";

describe("Personalization::createViewChangeHandler", () => {
  let processPropositions;
  let viewCache;

  let personalizationDetails;
  let event;
  let onResponse;

  let createProposition;

  beforeEach(() => {
    processPropositions = jasmine.createSpy("processPropositions");
    viewCache = jasmine.createSpyObj("viewCache", ["getView"]);

    personalizationDetails = jasmine.createSpyObj("personalizationDetails", [
      "isRenderDecisions",
      "getViewName",
    ]);
    event = "myevent";
    onResponse = jasmine.createSpy();

    createProposition = injectCreateProposition({
      preprocess: (data) => data,
      isPageWideSurface: () => false,
    });
  });

  const run = async () => {
    const viewChangeHandler = createViewChangeHandler({
      processPropositions,
      viewCache,
    });
    const decisionsMeta = await viewChangeHandler({
      event,
      personalizationDetails,
      onResponse,
    });
    const result = onResponse.calls.argsFor(0)[0]();
    return { decisionsMeta, result };
  };

  it("should trigger render if renderDecisions is true", async () => {
    viewCache.getView.and.returnValue(
      Promise.resolve(CART_VIEW_DECISIONS.map((p) => createProposition(p))),
    );
    personalizationDetails.isRenderDecisions.and.returnValue(true);
    personalizationDetails.getViewName.and.returnValue("cart");
    processPropositions.and.returnValue({
      render: () => Promise.resolve("decisionMeta"),
      returnedPropositions: [],
      returnedDecisions: CART_VIEW_DECISIONS,
    });

    const { decisionsMeta, result } = await run();

    expect(processPropositions).toHaveBeenCalledTimes(1);
    expect(decisionsMeta).toEqual("decisionMeta");

    expect(result.decisions).toEqual(CART_VIEW_DECISIONS);
  });
});
