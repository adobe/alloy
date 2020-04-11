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

import { isNonEmptyArray, groupBy, values, assign, noop } from "../../utils";
import { string } from "../../utils/validation";
import { initDomActionsModules, executeActions } from "./turbine";
import { hideContainers, showContainers } from "./flicker";
import collectClicks from "./helper/clicks/collectClicks";
import * as SCHEMAS from "../../constants/schemas";

const DECISIONS_HANDLE = "personalization:decisions";
const PAGE_WIDE_SCOPE = "__view__";
const allSchemas = values(SCHEMAS);
// This is used for Target VEC integration
const isAuthoringMode = () => document.location.href.indexOf("mboxEdit") !== -1;
const mergeMeta = (event, meta) => {
  event.mergeMeta({ personalization: { ...meta } });
};

const mergeQuery = (event, details) => {
  event.mergeQuery({ personalization: { ...details } });
};
const isNotDomAction = item => item.schema !== SCHEMAS.DOM_ACTION;

const filterDecisionsItemsBySchema = decisions => {
  return decisions.reduce((acc, decision) => {
    const { items = [] } = decision;
    const decisionItems = items.filter(isNotDomAction);

    if (isNonEmptyArray(decisionItems)) {
      const newDecision = {};
      newDecision.id = decision.id;

      if (decision.scope) {
        newDecision.scope = decision.scope;
      }

      newDecision.items = decisionItems;
      acc.push(newDecision);
    }

    return acc;
  }, []);
};

const buildActions = (decision, items) => {
  const meta = { decisionId: decision.id };

  return items.map(item => assign({}, item.data, { meta }));
};

const executeDecisions = (decisions, modules, logger) => {
  decisions.forEach(decision => {
    const group = groupBy(decision.items, item => item.schema);
    const items = group[SCHEMAS.DOM_ACTION];

    if (isNonEmptyArray(items)) {
      const actions = buildActions(decision, items);

      executeActions(actions, modules, logger);
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
const hasScopes = scopes => {
  return scopes.length > 0;
};
const isPersonalizationDisabled = (renderDecisionsEnabled, decisionsScopes) => {
  return !renderDecisionsEnabled && !hasScopes(decisionsScopes);
};

const createPersonalization = ({ config, logger, eventManager }) => {
  const { prehidingStyle } = config;
  const authoringModeEnabled = isAuthoringMode();
  const collect = createCollect(eventManager);
  const storage = [];
  const store = value => storage.push(value);
  const modules = initDomActionsModules(collect, store);

  return {
    lifecycle: {
      onBeforeEvent({
        event,
        renderDecisionsEnabled,
        decisionsScopes = [],
        onResponse = noop,
        onRequestFailure = noop
      }) {
        onRequestFailure(() => {
          showContainers();
        });

        if (
          isPersonalizationDisabled(renderDecisionsEnabled, decisionsScopes)
        ) {
          return;
        }

        if (authoringModeEnabled) {
          logger.warn("Rendering is disabled, authoring mode.");

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return;
        }

        onResponse(({ response }) => {
          const decisions = response.getPayloadsByType(DECISIONS_HANDLE);

          if (renderDecisionsEnabled) {
            executeDecisions(
              decisions,
              renderDecisionsEnabled,
              modules,
              logger
            );
            showContainers();
            const filteredDecisions = filterDecisionsItemsBySchema(decisions);
            return { decisions: filteredDecisions };
          }

          return { decisions };
        });

        const queryDetails = {};

        // For viewStart we try to hide the personalization containers
        if (renderDecisionsEnabled) {
          hideContainers(prehidingStyle);

          if (!decisionsScopes.includes(PAGE_WIDE_SCOPE)) {
            decisionsScopes.push(PAGE_WIDE_SCOPE);
          }
        }

        if (renderDecisionsEnabled || hasScopes(decisionsScopes)) {
          queryDetails.accepts = allSchemas;
          queryDetails.scopes = decisionsScopes;
        }

        mergeQuery(event, queryDetails);
      },
      onClick({ event, clickedElement }) {
        const merger = meta => mergeMeta(event, meta);

        collectClicks(merger, clickedElement, storage);
      }
    }
  };
};

createPersonalization.namespace = "Personalization";

createPersonalization.configValidators = {
  prehidingStyle: string().nonEmpty()
};

export default createPersonalization;
