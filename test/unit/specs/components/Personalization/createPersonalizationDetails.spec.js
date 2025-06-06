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
import { vi, beforeEach, describe, it, expect } from "vitest";
import PAGE_WIDE_SCOPE from "../../../../../src/constants/pageWideScope.js";
import createPersonalizationDetails from "../../../../../src/components/Personalization/createPersonalizationDetails.js";
import createGetPageLocation from "../../../../../src/components/Personalization/createGetPageLocation.js";
import {
  DEFAULT_CONTENT_ITEM,
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  MESSAGE_IN_APP,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM,
  RULESET_ITEM,
  MESSAGE_CONTENT_CARD,
} from "../../../../../src/constants/schema.js";

describe("Personalization::createPersonalizationDetails", () => {
  const TEST_SURFACE = "web://alloy.test.com/test/page/1";
  const window = {
    location: {
      host: "alloy.test.com",
      pathname: "/test/page/1/",
    },
  };
  const getPageLocation = createGetPageLocation({
    window,
  });
  let event;
  let logger;
  beforeEach(() => {
    event = {
      getViewName: vi.fn(),
    };
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
  });

  // s - has scopes or surfaces
  // i - cache is initialized
  // dp - defaultPersonalizationEnabled flag
  // fetch - should fetch data
  [
    {
      s: false,
      i: false,
      dp: false,
      fetch: false,
    },
    {
      s: true,
      i: false,
      dp: false,
      fetch: true,
    },
    {
      s: false,
      i: true,
      dp: false,
      fetch: false,
    },
    {
      s: true,
      i: true,
      dp: false,
      fetch: true,
    },
    {
      s: false,
      i: false,
      dp: true,
      fetch: true,
    },
    {
      s: true,
      i: false,
      dp: true,
      fetch: true,
    },
    {
      s: false,
      i: true,
      dp: true,
      fetch: true,
    },
    {
      s: true,
      i: true,
      dp: true,
      fetch: true,
    },
    {
      s: false,
      i: false,
      fetch: true,
    },
    {
      s: true,
      i: false,
      fetch: true,
    },
    {
      s: false,
      i: true,
      fetch: false,
    },
    {
      s: true,
      i: true,
      fetch: true,
    },
  ].forEach(({ s, i, dp, fetch }) => {
    it(`should ${fetch ? "" : "not "}fetch data when ${s ? "" : "no "}scopes, the cache is ${i ? "" : "not "}initialized, and initializePersonalization is '${dp}'`, () => {
      const personalizationDetails = createPersonalizationDetails({
        getPageLocation,
        renderDecisions: true,
        decisionScopes: [],
        personalization: {
          decisionScopes: s ? ["test"] : undefined,
          defaultPersonalizationEnabled: dp,
        },
        event,
        isCacheInitialized: i,
        logger,
      });
      expect(personalizationDetails.shouldFetchData()).toEqual(fetch);
    });
  });
  it("should fetch data when no cache, renderDecisions is true, no viewName and decisionScopes/surfaces (in non SPA world)", () => {
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = true;
    event.getViewName.mockReturnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: false,
      logger,
    });
    const expectedDecisionScopes = [PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
        DOM_ACTION,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: [TEST_SURFACE],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when no cache, renderDecisions is false, no viewName and decisionScopes/surfaces is empty", () => {
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = false;
    event.getViewName.mockReturnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: false,
      logger,
    });
    const expectedDecisionScopes = [PAGE_WIDE_SCOPE];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
        DOM_ACTION,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: [TEST_SURFACE],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when no cache, renderDecisions is false, no viewName and decisionScopes is not empty", () => {
    const decisionScopes = ["test1"];
    const personalization = {};
    const renderDecisions = false;
    event.getViewName.mockReturnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: false,
      logger,
    });
    const expectedDecisionScopes = ["test1", "__view__"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
        DOM_ACTION,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: [TEST_SURFACE],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when cache initialized, renderDecisions is false, no viewName, and decisionScopes is not empty", () => {
    const decisionScopes = ["test1"];
    const personalization = {};
    const renderDecisions = false;
    event.getViewName.mockReturnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      personalization,
      decisionScopes,
      event,
      isCacheInitialized: true,
      logger,
    });
    const expectedDecisionScopes = ["test1"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: [],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when cache initialized, renderDecisions is false, no viewName, and surfaces is not empty", () => {
    const decisionScopes = [];
    const personalization = {
      surfaces: ["web://test1.com"],
    };
    const renderDecisions = false;
    event.getViewName.mockReturnValue(undefined);
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: true,
      logger,
    });
    const expectedDecisionScopes = [];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: ["web://test1.com/"],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should fetch data when cache initialized, renderDecisions is true and decisionScopes is not empty and viewName exist", () => {
    event.getViewName.mockReturnValue("cart");
    const decisionScopes = ["test1"];
    const personalization = {
      decisionScopes: ["test2"],
      surfaces: ["web://test1.com"],
    };
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: true,
      logger,
    });
    const expectedDecisionScopes = ["test1", "test2"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: ["web://test1.com/"],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(personalizationDetails.hasSurfaces()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(true);
  });
  it("should do nothing when cache is initialized, renderDecisions true, no viewName and decisionScopes is empty", () => {
    event.getViewName.mockReturnValue(undefined);
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: true,
      logger,
    });
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should do nothing when cache is initialized, renderDecisions false, no viewName and decisionScopes is empty", () => {
    event.getViewName.mockReturnValue(undefined);
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = false;
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: true,
      logger,
    });
    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual(undefined);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.hasViewName()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(false);
  });
  it("should use cache when cache initialized, renderDecisions is true and decisionScopes is empty and viewName exist", () => {
    event.getViewName.mockReturnValue("cart");
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      personalization,
      decisionScopes,
      event,
      isCacheInitialized: true,
      logger,
    });
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.hasViewName()).toEqual(true);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(true);
  });
  it("should use cache when cache initialized, renderDecisions is false and decisionScopes is empty and viewName exist", () => {
    event.getViewName.mockReturnValue("cart");
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = false;
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      personalization,
      decisionScopes,
      event,
      isCacheInitialized: true,
      logger,
    });
    expect(personalizationDetails.isRenderDecisions()).toEqual(false);
    expect(personalizationDetails.hasScopes()).toEqual(false);
    expect(personalizationDetails.hasSurfaces()).toEqual(false);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.hasViewName()).toEqual(true);
    expect(personalizationDetails.shouldFetchData()).toEqual(false);
    expect(personalizationDetails.shouldUseCachedData()).toEqual(true);
  });
  it("should fetch data when cache initialized, renderDecisions is true and decisionScopes has __view__ and viewName exist", () => {
    event.getViewName.mockReturnValue("cart");
    const decisionScopes = ["__view__"];
    const personalization = {
      surfaces: [TEST_SURFACE],
    };
    const renderDecisions = true;
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: true,
      logger,
    });
    const expectedDecisionScopes = ["__view__"];
    const expectedQueryDetails = {
      schemas: [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
        DOM_ACTION,
      ],
      decisionScopes: expectedDecisionScopes,
      surfaces: [TEST_SURFACE],
    };
    const queryDetails = personalizationDetails.createQueryDetails();
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasScopes()).toEqual(true);
    expect(personalizationDetails.hasSurfaces()).toEqual(true);
    expect(queryDetails).toEqual(expectedQueryDetails);
    expect(personalizationDetails.getViewName()).toEqual("cart");
    expect(personalizationDetails.shouldFetchData()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(true);
  });
  it("hasViewName should return false when viewName is empty", () => {
    const decisionScopes = [];
    const personalization = {};
    const renderDecisions = true;
    event.getViewName.mockReturnValue("");
    const personalizationDetails = createPersonalizationDetails({
      getPageLocation,
      renderDecisions,
      decisionScopes,
      personalization,
      event,
      isCacheInitialized: false,
      logger,
    });
    expect(personalizationDetails.isRenderDecisions()).toEqual(true);
    expect(personalizationDetails.hasViewName()).toEqual(false);
  });
});
