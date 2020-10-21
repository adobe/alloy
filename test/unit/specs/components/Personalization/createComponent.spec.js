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
  let pageLoadHandler;
  let onClickHandler;
  let viewChangeHandler;
  let showContainers;
  let isAuthoringModeEnabled;
  let viewCache;
  let mergeQuery;
  let event;
  let personalizationComponent;

  const build = () => {
    personalizationComponent = createComponent({
      logger,
      pageLoadHandler,
      viewChangeHandler,
      onClickHandler,
      isAuthoringModeEnabled,
      mergeQuery,
      viewCache
    });
  };

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeQuery", "toJSON"]);
    event.toJSON.and.returnValue({});

    logger = {
      info: jasmine.createSpy(),
      warn: jasmine.createSpy()
    };
    isAuthoringModeEnabled = jasmine.createSpy().and.returnValue(false);
    pageLoadHandler = jasmine.createSpy();
    viewChangeHandler = jasmine.createSpy();
    onClickHandler = jasmine.createSpy();
    showContainers = jasmine.createSpy();
    mergeQuery = jasmine.createSpy();
    viewCache = jasmine.createSpyObj("viewCache", ["isInitialized"]);
  });

  it("shouldn't do anything since authoringMode is enabled", () => {
    isAuthoringModeEnabled.and.returnValue(true);
    build();
    const renderDecisions = true;
    const decisionScopes = ["foo"];
    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(logger.warn).toHaveBeenCalledWith(
      "Rendering is disabled, authoring mode."
    );
    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(mergeQuery).toHaveBeenCalledWith(event, { enabled: false });
    expect(pageLoadHandler).not.toHaveBeenCalled();
    expect(viewChangeHandler).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
  });

  it("should trigger pageLoad if there are decisionScopes", () => {
    build();
    const renderDecisions = false;
    const decisionScopes = ["alloy1"];
    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(pageLoadHandler).toHaveBeenCalled();
    expect(viewChangeHandler).not.toHaveBeenCalled();
    expect(mergeQuery).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
  });
  it("should trigger pageLoad if cache is not initialized", () => {
    build();
    const renderDecisions = false;
    const decisionScopes = [];
    viewCache.isInitialized.and.returnValue(false);

    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(pageLoadHandler).toHaveBeenCalled();
    expect(viewChangeHandler).not.toHaveBeenCalled();
    expect(mergeQuery).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
  });
  it("should trigger viewHandler if cache is initialized and viewName is provided", () => {
    build();
    const renderDecisions = false;
    const decisionScopes = [];
    viewCache.isInitialized.and.returnValue(true);
    event.toJSON.and.returnValue({
      xdm: { web: { webPageDetails: { viewName: "cart" } } }
    });

    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(pageLoadHandler).not.toHaveBeenCalled();
    expect(viewChangeHandler).toHaveBeenCalled();
    expect(mergeQuery).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
  });
  it("should trigger onClickHandler at onClick", () => {
    build();
    personalizationComponent.lifecycle.onClick({ event });

    expect(onClickHandler).toHaveBeenCalled();
  });
});
