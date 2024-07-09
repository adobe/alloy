/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import createEvent from "../../../../../../src/core/createEvent.js";
import createResponse from "../../../../../functional/helpers/createResponse.js";
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../../../../../src/constants/decisionProvider.js";
import {
  ALWAYS,
  NEVER,
} from "../../../../../../src/constants/propositionInteractionType.js";

export default (decisions) => {
  const response = createResponse({
    content: {
      handle: decisions.map((payload) => ({
        type: "personalization:decisions",
        payload,
      })),
    },
  });

  const actions = jasmine.createSpyObj("actions", {
    setHtml: () => Promise.resolve(),
    setText: () => Promise.resolve(),
    setAttributes: () => Promise.resolve(),
    swapImage: () => Promise.resolve(),
    setStyles: () => Promise.resolve(),
    rearrangeChildren: () => Promise.resolve(),
    removeNode: () => Promise.resolve(),
    replaceHtml: () => Promise.resolve(),
    appendHtml: () => Promise.resolve(),
    prependHtml: () => Promise.resolve(),
    insertHtmlAfter: () => Promise.resolve(),
    insertHtmlBefore: () => Promise.resolve(),
    click: () => Promise.resolve(),
  });

  const config = {
    targetMigrationEnabled: true,
    prehidingStyle: "myprehidingstyle",
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      [ADOBE_TARGET]: NEVER,
    },
  };
  const logger = {
    warn: spyOn(console, "warn").and.callThrough(),
    error: spyOn(console, "error").and.callThrough(),
    logOnContentRendering: spyOn(console, "info").and.callThrough()
  };
  const sendEvent = jasmine.createSpy("sendEvent");
  const eventManager = {
    createEvent,
    async sendEvent(event) {
      event.finalize();
      sendEvent(event.toJSON());
      return Promise.resolve();
    },
  };
  const getPageLocation = () => new URL("http://example.com/home");
  const window = {
    location: jasmine.createSpyObj("location", ["replace"]),
  };
  const hideContainers = jasmine.createSpy("hideContainers");
  const showContainers = jasmine.createSpy("showContainers");

  return {
    actions,
    config,
    logger,
    sendEvent,
    eventManager,
    getPageLocation,
    window,
    hideContainers,
    showContainers,
    response,
  };
};
