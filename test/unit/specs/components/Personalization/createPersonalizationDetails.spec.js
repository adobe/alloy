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
  DEFAULT_CONTENT_ITEM,
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM
} from "../../../../../src/components/Personalization/constants/schema";

describe("Personalization::createPersonalizationDetails", () => {
  let event;
  let viewCache;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["getViewName"]);
    viewCache = jasmine.createSpyObj("viewCache", ["getView", "isInitialized"]);
  });

  it("should fetch data when no cache, renderDecisions is true, no viewName and decisionScopes (in non SPA world)", () => {
    const decisionScopes = [];
    const renderDecisions = true;
    event.getViewName.and.returnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(false);
    const expectedDecisionScopes = [PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalizationDetails.createQueryDetails();

    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when no cache, renderDecisions is false, no viewName and decisionScopes is empty", () => {
    const decisionScopes = [];
    const renderDecisions = false;
    event.getViewName.and.returnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(false);
    const expectedDecisionScopes = [PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalizationDetails.createQueryDetails();

    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when no cache, renderDecisions is false, no viewName and decisionScopes is not empty", () => {
    const decisionScopes = ["test1"];
    const renderDecisions = false;
    event.getViewName.and.returnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(false);
    const expectedDecisionScopes = ["test1", "__view__"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalizationDetails.createQueryDetails();

    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when cache initialized, renderDecisions is false, no viewName, and decisionScopes is not empty", () => {
    const decisionScopes = ["test1"];
    const renderDecisions = false;
    event.getViewName.and.returnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);
    const expectedDecisionScopes = ["test1"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalizationDetails.createQueryDetails();

    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when cache initialized, renderDecisions is true and decisionScopes is not empty and viewName exist", () => {
    event.getViewName.and.returnValue("cart");

    const decisionScopes = ["test1", "test2"];
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    const expectedDecisionScopes = ["test1", "test2"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalizationDetails.createQueryDetails();

    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(true);
  });
  it("should do nothing when cache is initialized, renderDecisions true, no viewName and decisionScopes is empty", () => {
    event.getViewName.and.returnValue(undefined);
    const decisionScopes = [];
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should do nothing when cache is initialized, renderDecisions false, no viewName and decisionScopes is empty", () => {
    event.getViewName.and.returnValue(undefined);
    const decisionScopes = [];
    const renderDecisions = false;
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should use cache when cache initialized, renderDecisions is true and decisionScopes is empty and viewName exist", () => {
    event.getViewName.and.returnValue("cart");
    const decisionScopes = [];
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.hasViewName()).toEqual(true);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(true);
  });
  it("should use cache when cache initialized, renderDecisions is false and decisionScopes is empty and viewName exist", () => {
    event.getViewName.and.returnValue("cart");
    const decisionScopes = [];
    const renderDecisions = false;
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.hasViewName()).toEqual(true);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(true);
  });
  it("should fetch data when cache initialized, renderDecisions is true and decisionScopes has __view__ and viewName exist", () => {
    event.getViewName.and.returnValue("cart");
    const decisionScopes = ["__view__"];
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    viewCache.isInitialized.and.returnValue(true);

    const expectedDecisionScopes = ["__view__"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ],
      decisionScopes: expectedDecisionScopes
    };
    const queryDetails = personalizationDetails.createQueryDetails();

    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(true);
  });
  it("hasViewName should return false when viewName is empty", () => {
    const decisionScopes = [];
    const renderDecisions = true;
    event.getViewName.and.returnValue("");
    const personalizationDetails = createPersonalizationDetails({
      renderDecisions,
      decisionScopes,
      event,
      viewCache
    });
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
  });
});
