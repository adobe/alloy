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
import PAGE_WIDE_SCOPE from "../../../../../src/components/Personalization/constants/scope";
import createPersonalizationDetails from "../../../../../src/components/Personalization/createPersonalizationDetails";
import {
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM
} from "../../../../../src/components/Personalization/constants/schema";

describe("Personalization::createPersonalizationDetails", () => {
  let event;
  let viewCache;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["toJSON"]);
    viewCache = jasmine.createSpyObj("viewCache", ["getView", "isInitialized"]);
  });

  it("should return true if renderDecisions is true", () => {
    event.toJSON.and.returnValue({
      xdm: { web: { webPageDetails: { viewName: "cart" } } }
    });
    const decisionScopes = ["test1", "test2"];
    const renderDecisions = true;
    const personalization = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    const expectedDecisionScopes = ["test1", "test2", PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalization.createQueryDetails();

    expect(personalization.isRenderDecisions()).toEqual(true);
    expect(personalization.hasScopes()).toEqual(true);
    expect(personalization.getDecisionScopes()).toEqual(expectedDecisionScopes);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalization.getViewName()).toEqual("cart");
    expect(personalization.shouldFetchData()).toEqual(true);
    expect(personalization.hasViewName()).toEqual(true);
    expect(personalization.shouldUseCachedData()).toEqual(true);
  });
  it("should return false if renderDecisions is false", () => {
    const decisionScopes = [];
    const renderDecisions = false;
    event.toJSON.and.returnValue({ xdm: {} });
    const personalization = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(false);
    const expectedDecisionScopes = [PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalization.createQueryDetails();

    expect(personalization.isRenderDecisions()).toEqual(false);
    expect(personalization.hasScopes()).toEqual(false);
    expect(personalization.getDecisionScopes()).toEqual(expectedDecisionScopes);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalization.getViewName()).toEqual(undefined);
    expect(personalization.shouldFetchData()).toEqual(true);
    expect(personalization.hasViewName()).toEqual(false);
    expect(personalization.shouldUseCachedData()).toEqual(false);
  });
  it("should return true at shouldFetchData", () => {
    event.toJSON.and.returnValue({ xdm: {} });
    const decisionScopes = [];
    const renderDecisions = false;
    const personalization = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(false);

    const expectedDecisionScopes = [PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalization.createQueryDetails();

    expect(personalization.isRenderDecisions()).toEqual(false);
    expect(personalization.hasScopes()).toEqual(false);
    expect(personalization.getDecisionScopes()).toEqual(expectedDecisionScopes);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalization.getViewName()).toEqual(undefined);
    expect(personalization.shouldFetchData()).toEqual(true);
    expect(personalization.hasViewName()).toEqual(false);
    expect(personalization.shouldUseCachedData()).toEqual(false);
  });
});
