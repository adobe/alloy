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
import { vi } from "vitest";
import createEvent from "../../../../../../src/core/createEvent.js";
import createResponse from "../../../../helpers/createResponse.js";
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
  const actions = {
    setHtml: vi.fn().mockReturnValue(() => Promise.resolve()),
    setText: vi.fn().mockReturnValue(() => Promise.resolve()),
    setAttributes: vi.fn().mockReturnValue(() => Promise.resolve()),
    swapImage: vi.fn().mockReturnValue(() => Promise.resolve()),
    setStyles: vi.fn().mockReturnValue(() => Promise.resolve()),
    rearrangeChildren: vi.fn().mockReturnValue(() => Promise.resolve()),
    removeNode: vi.fn().mockReturnValue(() => Promise.resolve()),
    replaceHtml: vi.fn().mockReturnValue(() => Promise.resolve()),
    appendHtml: vi.fn().mockReturnValue(() => Promise.resolve()),
    prependHtml: vi.fn().mockReturnValue(() => Promise.resolve()),
    insertHtmlAfter: vi.fn().mockReturnValue(() => Promise.resolve()),
    insertHtmlBefore: vi.fn().mockReturnValue(() => Promise.resolve()),
    click: vi.fn().mockReturnValue(() => Promise.resolve()),
  };
  const config = {
    targetMigrationEnabled: true,
    prehidingStyle: "myprehidingstyle",
    autoCollectPropositionInteractions: {
      [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
      [ADOBE_TARGET]: NEVER,
    },
  };
  const logger = {
    warn: vi.spyOn(console, "warn"),
    error: vi.spyOn(console, "error"),
    logOnContentRendering: vi.fn(),
    logOnContentHiding: vi.fn(),
  };
  const sendEvent = vi.fn();
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
    location: {
      replace: vi.fn(),
    },
  };
  const hideContainers = vi.fn();
  const showContainers = vi.fn();
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
