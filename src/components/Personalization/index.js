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

import { isNonEmptyArray, uuid } from "../../utils";
import { initRuleComponentModules, executeRules } from "./turbine";
import { hideContainers, showContainers, hideElements } from "./flicker";

const PAGE_HANDLE = "personalization:page";
const SESSION_ID_COOKIE = "SID";
const SESSION_ID_TTL = 31 * 60 * 1000;
const EVENT_COMMAND = "event";

const isElementExists = event => event.moduleType === "elementExists";

const getOrCreateSessionId = cookie => {
  let cookieValue = cookie.get(SESSION_ID_COOKIE);
  const now = Date.now();
  const expires = now + SESSION_ID_TTL;

  if (!cookieValue || now > cookieValue.expires) {
    cookieValue = { value: uuid(), expires };
  } else {
    cookieValue.expires = expires;
  }

  // We have to extend session ID lifetime
  cookie.set(SESSION_ID_COOKIE, cookieValue);

  return cookieValue.value;
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
  let optIn;

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { componentRegistry } = tools;
        ({ optIn } = tools);
        ruleComponentModules = initRuleComponentModules(
          componentRegistry.getCommand(EVENT_COMMAND)
        );
      },
      onBeforeDataCollection(payload) {
        return optIn.whenOptedIn().then(() => {
          const sessionId = getOrCreateSessionId(cookie);

          payload.mergeMeta({ personalization: { sessionId } });
        });
      },
      onBeforeEvent(event, options, isViewStart) {
        if (!isViewStart) {
          // If NOT isViewStart disable personalization
          event.mergeQuery({ personalization: { enabled: false } });
          return;
        }

        event.expectResponse();

        // For viewStart we try to hide the personalization containers
        hideContainers(prehidingId, prehidingStyle);
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
