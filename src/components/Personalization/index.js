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

import CONFIG_DOC_URI from "../../constants/docUri";
import { isNonEmptyArray, assign } from "../../utils";
import { string } from "../../utils/validation";
import { initRuleComponentModules, executeRules } from "./turbine";
import { hideContainers, showContainers } from "./flicker";
import collectClicks from "./helper/clicks/collectClicks";

const DECISIONS_HANDLE = "personalization:decisions";

// This is used for Target VEC integration
const isAuthoringMode = () => document.location.href.indexOf("mboxEdit") !== -1;
const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
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

const validateEvent = (event, logger) => {
  const warnings = event.validate();

  if (warnings.length) {
    logger.warn(
      `Invalid getDecisions command options:\n\t - ${warnings.join(
        "\n\t - "
      )}\nFor documentation covering the getDecisions command see: ${CONFIG_DOC_URI}`
    );
  }
};

const createPersonalization = ({ config, logger, eventManager }) => {
  const { prehidingStyle } = config;
  const authoringModeEnabled = isAuthoringMode();
  const collect = createCollect(eventManager);
  const storage = [];
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

        if (isViewStart) {
          event.expectResponse();

          // For viewStart we try to hide the personalization containers
          hideContainers(prehidingStyle);
          return;
        }

        if (scopes) {
          event.expectResponse();
          mergeQuery(event, { scopes });
          return;
        }

        mergeQuery(event, { enabled: false });
      },
      onResponse({ response }) {
        if (authoringModeEnabled) {
          return;
        }

        const fragments = response.getPayloadsByType(DECISIONS_HANDLE);

        executeFragments(fragments, ruleComponentModules, logger);

        showContainers();
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
      getDecisions(options) {
        let { xdm } = options;
        const {
          scopes = [],
          data,
          type: eventType,
          mergeId: eventMergeId
        } = options;
        const event = eventManager.createEvent();

        if (eventType || eventMergeId) {
          xdm = Object(xdm);
        }

        if (eventType) {
          assign(xdm, { eventType });
        }

        if (eventMergeId) {
          assign(xdm, { eventMergeId });
        }

        event.setUserXdm(xdm);
        event.setUserData(data);

        validateEvent(event, logger);

        return eventManager.sendEvent(event, { scopes });
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
