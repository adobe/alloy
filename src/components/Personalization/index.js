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

import { isNonEmptyArray, groupBy } from "../../utils";
import { string } from "../../utils/validation";
import { initRuleComponentModules, executeRules } from "./turbine";
import { hideContainers, showContainers } from "./flicker";
import collectClicks from "./helper/clicks/collectClicks";

const DECISIONS_HANDLE = "personalization:decisions";
const PAGE_WIDE_SCOPE = "page_wide_scope";
// This is used for Target VEC integration
const isAuthoringMode = () => document.location.href.indexOf("mboxEdit") !== -1;
const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
};

const storeDecisions = (storage, decisions) => {
  if (!decisions) {
    return;
  }

  const filteredDecisions = groupBy(
    decisions,
    decision => decision.scope || PAGE_WIDE_SCOPE
  );

  Object.keys(filteredDecisions).forEach(scope => {
    storage[scope] = filteredDecisions[scope];
  });
};

const filterDecisions = (storage, scopes) => {
  const decisions = [];

  scopes.forEach(s => {
    if (storage[s]) {
      decisions.push(...storage[s]);
    }
  });

  return decisions;
};

const executeFragments = (fragments, modules, logger) => {
  fragments.forEach(fragment => {
    const { rules = [] } = fragment;

    if (isNonEmptyArray(rules)) {
      executeRules(rules, modules, logger);
    }
  });
};

const createCollect = eventManager => {
  return meta => {
    const event = eventManager.createEvent();

    mergeMeta(event, meta);

    eventManager.sendEvent(event);
  };
};

const createPersonalization = ({ config, logger, eventManager }) => {
  const { prehidingStyle } = config;
  const authoringModeEnabled = isAuthoringMode();
  const collect = createCollect(eventManager);
  const storage = [];
  const decisionsStorage = {};
  const store = value => storage.push(value);
  const ruleComponentModules = initRuleComponentModules(collect, store);

  return {
    lifecycle: {
      onBeforeEvent({ event, isViewStart, scopes }) {
        if (authoringModeEnabled) {
          logger.warn("Rendering is disabled, authoring mode.");

          mergeQuery(event, { enabled: false });
          return;
        }

        if (isViewStart || scopes) {
          event.expectResponse();
          mergeQuery(event, { scopes });

          // For viewStart we try to hide the personalization containers
          if (isViewStart) {
            hideContainers(prehidingStyle);
          }

          return;
        }

        mergeQuery(event, { enabled: false });
      },
      onResponse({ response }) {
        if (authoringModeEnabled) {
          return;
        }

        const decisions = response.getPayloadsByType(DECISIONS_HANDLE);

        executeFragments(decisions, ruleComponentModules, logger);

        showContainers();

        storeDecisions(decisionsStorage, decisions);
      },
      onRequestFailure() {
        showContainers();
      },
      onClick({ event, clickedElement }) {
        const merger = meta => mergeMeta(event, meta);

        collectClicks(merger, clickedElement, storage);
      }
    },

    commands: {
      getDecisions(options = {}) {
        const { viewStart, scopes = [] } = options;
        if (viewStart || scopes) {
          if (viewStart) {
            scopes.push(PAGE_WIDE_SCOPE);
          }

          return filterDecisions(decisionsStorage, scopes);
        }

        throw new Error(
          "Invalid getDecisions command options parameter. Please consult the documentation."
        );
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
