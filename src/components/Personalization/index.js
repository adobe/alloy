/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { isNonEmptyArray, uuid, getTopLevelCookieDomain } from "../../utils";
import { initRuleComponentModules, executeRules } from "./turbine";
import { hideContainers, showContainers, hideElements } from "./flicker";

const PAGE_HANDLE = "personalization:page";
const SESSION_ID_COOKIE = "alloy-session-id";
const SESSION_ID_TTL = 31 * 60 * 1000;
const EVENT_COMMAND = "event";
const isElementExists = event => event.moduleType === "elementExists";

const getOrCreateSessionId = cookie => {
  let sessionId = cookie.get(SESSION_ID_COOKIE);
  const domain = getTopLevelCookieDomain(window, cookie);
  const expires = new Date(Date.now() + SESSION_ID_TTL);

  if (!sessionId) {
    sessionId = uuid();
  }

  // We have to extend cookie lifetime
  cookie.set(SESSION_ID_COOKIE, sessionId, { domain, expires });

  return sessionId;
};
const hideElementsForPage = fragment => {
  const { rules = [] } = fragment;

  rules.forEach(rule => {
    const { events = [] } = rule;
    const filteredEvents = events.filter(isElementExists);

    filteredEvents.forEach(event => {
      const { settings = {} } = event;
      const { prehidingSelector } = settings;

      if (prehidingSelector) {
        hideElements(prehidingSelector);
      }
    });
  });
};

const executeFragment = (fragment, modules, logger) => {
  const { rules = [] } = fragment;

  if (isNonEmptyArray(rules)) {
    executeRules(rules, modules, logger);
  }
};

const createPersonalization = ({ config, logger, cookie }) => {
  const { prehidingId, prehidingStyle } = config;
  let ruleComponentModules;

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { componentRegistry } = tools;
        ruleComponentModules = initRuleComponentModules(
          componentRegistry.getCommand(EVENT_COMMAND)
        );
      },
      onBeforeDataCollection(payload) {
        const sessionId = getOrCreateSessionId(cookie);

        payload.mergeMeta({ personalization: { sessionId } });
      },
      onBeforeEvent(event, options, isViewStart) {
        if (isViewStart) {
          // For viewStart we try to hide the personalization containers
          hideContainers(prehidingId, prehidingStyle);
          event.expectResponse();
        }
      },
      onResponse(response) {
        const fragment = response.getPayloadByType(PAGE_HANDLE) || {};

        // On response we first hide all the elements for
        // personalization:page handle
        hideElementsForPage(fragment);

        // Once the all element are hidden
        // we have to show the containers
        showContainers(prehidingId);

        executeFragment(fragment, ruleComponentModules, logger);
      },
      onResponseError() {
        showContainers(prehidingId);
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

export default createPersonalization;
