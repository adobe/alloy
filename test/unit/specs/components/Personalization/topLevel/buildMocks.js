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

export default (decisions) => {
  const response = createResponse({
    content: {
      handle: decisions.map((payload) => ({
        type: "personalization:decisions",
        payload,
      })),
    },
  });

  const actions = jasmine.createSpyObj("actions", [
    "createAction",
    "setHtml",
    "setText",
    "setAttributes",
    "swapImage",
    "setStyles",
    "rearrangeChildren",
    "removeNode",
    "replaceHtml",
    "appendHtml",
    "prependHtml",
    "insertHtmlAfter",
    "insertHtmlBefore",
  ]);

  const config = {
    targetMigrationEnabled: true,
    prehidingStyle: "myprehidingstyle",
  };
  const logger = {
    warn: spyOn(console, "warn").and.callThrough(),
    error: spyOn(console, "error").and.callThrough(),
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
