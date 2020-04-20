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
import * as SCHEMAS from "../../../../../src/constants/schemas";
import { values } from "../../../../../src/utils";

const ALL_SCHEMAS = values(SCHEMAS);

describe("Personalization", () => {
  let logger;
  let config;
  let onResponseHandler;
  let onClickHandler;
  let hideContainers;
  let showContainers;
  let hasScopes;
  let isAuthoringModeEnabled;
  let getDecisionScopes;
  let mergeQuery;
  let createQueryDetails;
  let event;
  let personalizationComponent;

  const build = () => {
    personalizationComponent = createComponent({
      config,
      logger,
      onResponseHandler,
      onClickHandler,
      hideContainers,
      showContainers,
      hasScopes,
      isAuthoringModeEnabled,
      getDecisionScopes,
      mergeQuery,
      createQueryDetails
    });
  };

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeQuery"]);

    logger = {
      info: jasmine.createSpy(),
      warn: jasmine.createSpy()
    };
    isAuthoringModeEnabled = jasmine.createSpy().and.returnValue(false);
    config = jasmine.createSpy();
    onResponseHandler = jasmine.createSpy();
    onClickHandler = jasmine.createSpy();
    hideContainers = jasmine.createSpy();
    showContainers = jasmine.createSpy();
    hasScopes = jasmine.createSpy();
    getDecisionScopes = jasmine.createSpy();
    mergeQuery = jasmine.createSpy();
    createQueryDetails = jasmine.createSpy();
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

    expect(onResponseHandler).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
    expect(hideContainers).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
    expect(hasScopes).not.toHaveBeenCalled();
    expect(getDecisionScopes).not.toHaveBeenCalled();
    expect(createQueryDetails).not.toHaveBeenCalled();
  });

  it("shouldn't do anything since personalization is disabled", () => {
    build();
    hasScopes.and.returnValue(false);
    const renderDecisions = false;
    const decisionScopes = [];
    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalledWith("Personalization is skipped.");
    expect(getDecisionScopes).toHaveBeenCalled();
    expect(hasScopes).toHaveBeenCalled();

    expect(mergeQuery).not.toHaveBeenCalled();
    expect(onResponseHandler).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
    expect(hideContainers).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
    expect(createQueryDetails).not.toHaveBeenCalled();
  });

  it("should only merge the query data", () => {
    const renderDecisions = false;
    const decisionScopes = ["foo"];
    const eventQueryDetails = {
      accepts: ALL_SCHEMAS,
      decisionScopes
    };
    build();
    hasScopes.and.returnValue(true);
    getDecisionScopes.and.returnValue("foo");
    createQueryDetails.and.returnValue(eventQueryDetails);

    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(getDecisionScopes).toHaveBeenCalled();
    expect(hasScopes).toHaveBeenCalled();
    expect(createQueryDetails).toHaveBeenCalled();
    expect(mergeQuery).toHaveBeenCalledWith(event, eventQueryDetails);

    expect(hideContainers).not.toHaveBeenCalled();
    expect(onResponseHandler).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
  });

  it("should merge the query data and hide containers", () => {
    const renderDecisions = true;
    const decisionScopes = ["foo"];
    const eventQueryDetails = {
      accepts: ALL_SCHEMAS,
      decisionScopes
    };
    build();
    hasScopes.and.returnValue(true);
    getDecisionScopes.and.returnValue("foo");
    createQueryDetails.and.returnValue(eventQueryDetails);

    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(getDecisionScopes).toHaveBeenCalled();
    expect(hasScopes).toHaveBeenCalled();
    expect(createQueryDetails).toHaveBeenCalled();
    expect(mergeQuery).toHaveBeenCalledWith(event, eventQueryDetails);
    expect(hideContainers).toHaveBeenCalled();

    expect(onResponseHandler).not.toHaveBeenCalled();
    expect(onClickHandler).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
  });

  it("should merge the query data, hide containers and trigger onResponseHandler", () => {
    const renderDecisions = true;
    const decisionScopes = ["foo"];
    const eventQueryDetails = {
      accepts: ALL_SCHEMAS,
      decisionScopes
    };
    build();
    hasScopes.and.returnValue(true);
    getDecisionScopes.and.returnValue("foo");
    createQueryDetails.and.returnValue(eventQueryDetails);

    const onResponse = func => {
      func({});
    };

    personalizationComponent.lifecycle.onBeforeEvent({
      event,
      renderDecisions,
      decisionScopes,
      onResponse
    });

    expect(isAuthoringModeEnabled).toHaveBeenCalled();
    expect(getDecisionScopes).toHaveBeenCalled();
    expect(hasScopes).toHaveBeenCalled();
    expect(createQueryDetails).toHaveBeenCalled();
    expect(mergeQuery).toHaveBeenCalledWith(event, eventQueryDetails);
    expect(hideContainers).toHaveBeenCalled();
    expect(onResponseHandler).toHaveBeenCalled();

    expect(onClickHandler).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
  });
});
