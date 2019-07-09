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

import { isNonEmptyArray } from "../../utils";
import { initRuleComponentModules, executeRules } from "./turbine";
import { hideContainers, showContainers, hideElements } from "./flicker";

const PAGE_HANDLE = "personalization:page";
const EVENT_COMMAND = "event";
const isElementExists = event => event.moduleType === "elementExists";

const hideElementsForPage = fragments => {
  fragments.forEach(fragment => {
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
  });
};

const executeFragments = (fragments, modules, logger) => {
  fragments.forEach(fragment => {
    const { rules = [] } = fragment;

    if (isNonEmptyArray(rules)) {
      executeRules(rules, modules, logger);
    }
  });
};

const createPersonalization = ({ config, logger }) => {
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
      onBeforeEvent(event, options, isViewStart) {
        if (isViewStart) {
          // For viewStart we try to hide the personalization containers
          hideContainers(prehidingId, prehidingStyle);
          event.expectResponse();
        }
      },
      onResponse(response) {
        const fragments = response.getPayloadByType(PAGE_HANDLE) || [];

        // On response we first hide all the elements for
        // personalization:page handle
        hideElementsForPage(fragments);

        // Once the all element are hidden
        // we have to show the containers
        showContainers(prehidingId);

        executeFragments(fragments, ruleComponentModules, logger);
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

export default createPersonalization;
