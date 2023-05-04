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

import createComponent from "../../../../../src/components/Personalization/createComponent";

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
      setTargetMigration
    });
  };

  beforeEach(() => {
    event = jasmine.createSpyObj("event", [
      "mergeQuery",
      "mergeXdm",
      "getViewName",
      "getEventType",
      "getPropositionEventType"
    ]);
    event.getViewName.and.returnValue({});
    logger = {
      info: jasmine.createSpy("logger.info"),
      warn: jasmine.createSpy("logger.warn")
    };
    isAuthoringModeEnabled = jasmine
      .createSpy("isAuthoringModeEnabled")
      .and.returnValue(false);
    fetchDataHandler = jasmine.createSpy("fetchDataHandler");
    viewChangeHandler = jasmine.createSpy("viewChangeHandler");
    onClickHandler = jasmine.createSpy("onClickHandler");
    showContainers = jasmine.createSpy("showContainers");
    mergeQuery = jasmine.createSpy("mergeQuery");
    viewCache = jasmine.createSpyObj("viewCache", [
      "isInitialized",
      "storeViews"
    ]);
    setTargetMigration = jasmine.createSpy("setTargetMigration");

    build();
  });

  describe("onBeforeEvent", () => {
    it("shouldn't do anything since authoringMode is enabled", () => {
      isAuthoringModeEnabled.and.returnValue(true);
      const renderDecisions = true;
      const personalization = {
        decisionScopes: ["foo"]
      };
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization
      });

      expect(logger.warn).toHaveBeenCalledWith(
        "Rendering is disabled for authoring mode."
      );
      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(mergeQuery).toHaveBeenCalledWith(event, { enabled: false });
      expect(fetchDataHandler).not.toHaveBeenCalled();
      expect(viewChangeHandler).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(showContainers).not.toHaveBeenCalled();
      expect(viewCache.storeViews).not.toHaveBeenCalled();
    });

    it("should trigger pageLoad if there are decisionScopes", () => {
      const renderDecisions = false;
      const personalization = {
        decisionScopes: ["alloy1"]
      };
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization
      });

      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(fetchDataHandler).toHaveBeenCalled();
      expect(viewChangeHandler).not.toHaveBeenCalled();
      expect(mergeQuery).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(viewCache.storeViews).toHaveBeenCalled();
    });
    it("should trigger pageLoad if cache is not initialized", () => {
      const renderDecisions = false;
      const personalization = {
        decisionScopes: []
      };
      viewCache.isInitialized.and.returnValue(false);

      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization
      });

      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(fetchDataHandler).toHaveBeenCalled();
      expect(viewChangeHandler).not.toHaveBeenCalled();
      expect(mergeQuery).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(viewCache.storeViews).toHaveBeenCalled();
    });
    it("should trigger viewHandler if cache is initialized and viewName is provided", () => {
      const renderDecisions = false;
      const personalization = {
        decisionScopes: []
      };
      viewCache.isInitialized.and.returnValue(true);
      event.getViewName.and.returnValue("cart");

      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization
      });

      expect(isAuthoringModeEnabled).toHaveBeenCalled();
      expect(fetchDataHandler).not.toHaveBeenCalled();
      expect(viewChangeHandler).toHaveBeenCalled();
      expect(mergeQuery).not.toHaveBeenCalled();
      expect(onClickHandler).not.toHaveBeenCalled();
      expect(viewCache.storeViews).not.toHaveBeenCalled();
    });
    it("should trigger onClickHandler at onClick", () => {
      personalizationComponent.lifecycle.onClick({ event });

      expect(onClickHandler).toHaveBeenCalled();
    });
    it("should call showContainers() when a request fails", () => {
      viewCache.isInitialized.and.returnValue(true);
      const onRequestFailure = jasmine
        .createSpy("onRequestFailure")
        .and.callFake(func => func());

      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        onRequestFailure
      });

      expect(onRequestFailure).toHaveBeenCalled();
      expect(showContainers).toHaveBeenCalled();
    });

    it("should set _experience.decisioning properties and default to display", () => {
      const renderDecisions = false;
      const personalization = {};
      const propositions = [
        {
          id: "prop1",
          scope: "prop1Scope",
          scopeDetails: { a: 1 },
          extra: "extra"
        },
        {
          id: "prop2",
          scope: "prop2Scope",
          scopeDetails: { b: 2 }
        }
      ];
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
        propositions
      });

      expect(event.mergeXdm).toHaveBeenCalledWith({
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "prop1",
                scope: "prop1Scope",
                scopeDetails: { a: 1 }
              },
              {
                id: "prop2",
                scope: "prop2Scope",
                scopeDetails: { b: 2 }
              }
            ],
            propositionEventType: {
              display: 1
            }
          }
        }
      });
    });
    it("should use the interact event type from the xdm event", () => {
      const renderDecisions = false;
      const personalization = {};
      const propositions = [
        {
          id: "prop1",
          scope: "prop1Scope",
          scopeDetails: { a: 1 },
          extra: "extra"
        }
      ];
      event.getEventType.and.returnValue("decisioning.propositionInteract");
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
        propositions
      });

      expect(event.mergeXdm).toHaveBeenCalledWith({
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "prop1",
                scope: "prop1Scope",
                scopeDetails: { a: 1 }
              }
            ],
            propositionEventType: {
              interact: 1
            }
          }
        }
      });
    });
    it("should use the event type from _experience.decisioning.propositionEventType", () => {
      const renderDecisions = false;
      const personalization = {};
      const propositions = [
        {
          id: "prop1",
          scope: "prop1Scope",
          scopeDetails: { a: 1 },
          extra: "extra"
        }
      ];
      event.getPropositionEventType.and.returnValue("interact");
      personalizationComponent.lifecycle.onBeforeEvent({
        event,
        renderDecisions,
        personalization,
        propositions
      });

      expect(event.mergeXdm).toHaveBeenCalledWith({
        _experience: {
          decisioning: {
            propositions: [
              {
                id: "prop1",
                scope: "prop1Scope",
                scopeDetails: { a: 1 }
              }
            ],
            propositionEventType: {
              interact: 1
            }
          }
        }
      });
    });
  });

  describe("onBeforeRequest", () => {
    it("should always call setTargetMigration during onBeforeRequest", () => {
      const request = jasmine.createSpyObj("request", ["getPayload"]);
      personalizationComponent.lifecycle.onBeforeRequest({
        request
      });

      expect(setTargetMigration).toHaveBeenCalledOnceWith(request);
    });
  });
});
