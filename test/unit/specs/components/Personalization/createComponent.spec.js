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
import createComponent from "../../../../../src/components/Personalization/createComponent.js";

describe("Personalization", () => {
  let logger;
  let fetchDataHandler;
  let onClickHandler;
  let viewChangeHandler;
  let showContainers;
  let isAuthoringModeEnabled;
  let viewCache;
  let mergeQuery;
  let event;
  let personalizationComponent;
  let setTargetMigration;
  let mergeDecisionsMeta;
  let renderedPropositions;
  let cacheUpdate;
  const build = () => {
    personalizationComponent = createComponent({
      logger,
      fetchDataHandler,
      viewChangeHandler,
      onClickHandler,
      isAuthoringModeEnabled,
      mergeQuery,
      viewCache,
      showContainers,
      setTargetMigration,
      mergeDecisionsMeta,
      renderedPropositions,
    });
  };
  beforeEach(() => {
    event = {
      mergeQuery: vi.fn(),
      getViewName: vi.fn(),
    };
    event.getViewName.mockReturnValue({});
    logger = {
      info: vi.fn(),
      warn: vi.fn(),
    };
    isAuthoringModeEnabled = vi.fn().mockReturnValue(false);
    fetchDataHandler = vi.fn();
    viewChangeHandler = vi.fn();
    onClickHandler = vi.fn();
    showContainers = vi.fn();
    mergeQuery = vi.fn();
    viewCache = {
      isInitialized: vi.fn(),
      createCacheUpdate: vi.fn(),
    };
    cacheUpdate = {
      update: vi.fn(),
      cancel: vi.fn(),
    };
    viewCache.createCacheUpdate.mockReturnValue(cacheUpdate);
    setTargetMigration = vi.fn();
    mergeDecisionsMeta = vi.fn();
    renderedPropositions = {
      clear: vi.fn(),
    };
    build();
  });
  describe("onBeforeEvent", () => {
    it("shouldn't do anything since authoringMode is enabled", () => {
      isAuthoringModeEnabled.mockReturnValue(true);
      const renderDecisions = true;
      const personalization = {
        decisionScopes: ["foo"],
      };
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
      });
      expect(logger.warn).toHaveBeenCalledWith(
        "Rendering is disabled for authoring mode.",
      );
      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(mergeQuery).toHaveBeenCalledWith(event, {
        enabled: false,
      });
      expect(fetchDataHandler).not.toHaveBeenCalled();
      expect(viewChangeHandler).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(showContainers).not.toHaveBeenCalled();
      expect(viewCache.createCacheUpdate).not.toHaveBeenCalled();
    });
    it("should trigger pageLoad if there are decisionScopes", () => {
      const renderDecisions = false;
      const personalization = {
        decisionScopes: ["alloy1"],
      };
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
      });
      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(fetchDataHandler).toHaveBeenCalled();
      expect(viewChangeHandler).not.toHaveBeenCalled();
      expect(mergeQuery).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(viewCache.createCacheUpdate).toHaveBeenCalled();
    });
    it("should trigger pageLoad if cache is not initialized", () => {
      const renderDecisions = false;
      const personalization = {
        decisionScopes: [],
      };
      viewCache.isInitialized.mockReturnValue(false);
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
      });
      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(fetchDataHandler).toHaveBeenCalled();
      expect(viewChangeHandler).not.toHaveBeenCalled();
      expect(mergeQuery).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(viewCache.createCacheUpdate).toHaveBeenCalled();
    });
    it("should trigger viewHandler if cache is initialized and viewName is provided", () => {
      const renderDecisions = false;
      const personalization = {
        decisionScopes: [],
      };
      viewCache.isInitialized.mockReturnValue(true);
      event.getViewName.mockReturnValue("cart");
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
      });
      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(fetchDataHandler).not.toHaveBeenCalled();
      expect(viewChangeHandler).toHaveBeenCalled();
      expect(mergeQuery).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(viewCache.createCacheUpdate).not.toHaveBeenCalled();
    });
    it("should trigger onClickHandler at onClick", () => {
      personalizationComponent.lifecycle.onClick({
        event,
      });
      expect(onClickHandler).toHaveBeenCalled();
    });
    it("should call showContainers() when a request fails", () => {
      viewCache.isInitialized.mockReturnValue(true);
      const onRequestFailure = vi.fn().mockImplementation((func) => func());
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        onRequestFailure,
      });
      expect(onRequestFailure).toHaveBeenCalled();
      expect(showContainers).toHaveBeenCalled();
    });
  });
  describe("onBeforeRequest", () => {
    it("should always call setTargetMigration during onBeforeRequest", () => {
      const request = {
        getPayload: vi.fn(),
      };
      personalizationComponent.lifecycle.onBeforeRequest({
        request,
      });
      expect(setTargetMigration).toHaveBeenNthCalledWith(1, request);
    });
  });
});
