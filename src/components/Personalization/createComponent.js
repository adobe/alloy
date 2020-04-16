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

import { noop } from "../../utils";
import { hasScopes, isAuthoringModeEnabled, getDecisionScopes } from "./utils";
import { initDomActionsModules } from "./dom-actions";
import collectClicks from "./dom-actions/clicks/collectClicks";
import { hideContainers, showContainers } from "./flicker";
import { mergeMeta, mergeQuery, createQueryDetails } from "./event";

const createCollect = eventManager => {
  return meta => {
    const event = eventManager.createEvent();

    mergeMeta(event, meta);

    eventManager.sendEvent(event);
  };
};

export default ({ config, logger, eventManager, onResponseHandler }) => {
  const { prehidingStyle } = config;
  const collect = createCollect(eventManager);
  const storage = [];
  const store = value => storage.push(value);
  const modules = initDomActionsModules(collect, store);

  return {
    lifecycle: {
      onBeforeEvent({
        event,
        renderDecisions,
        decisionScopes = [],
        onResponse = noop,
        onRequestFailure = noop
      }) {
        if (isAuthoringModeEnabled()) {
          logger.warn("Rendering is disabled, authoring mode.");

          // If we are in authoring mode we disable personalization
          mergeQuery(event, { enabled: false });
          return;
        }

        const scopes = getDecisionScopes(renderDecisions, decisionScopes);

        if (!hasScopes(scopes)) {
          logger.info("Personalization is skipped.");
          return;
        }

        // For renderDecisions we try to hide the personalization containers
        if (renderDecisions) {
          hideContainers(prehidingStyle);
        }

        mergeQuery(event, createQueryDetails(scopes));

        onResponse(({ response }) =>
          onResponseHandler({ renderDecisions, response, modules, logger })
        );

        onRequestFailure(() => {
          showContainers();
        });
      },

      onClick({ event, clickedElement }) {
        const merger = meta => mergeMeta(event, meta);

        collectClicks(merger, clickedElement, storage);
      }
    }
  };
};
