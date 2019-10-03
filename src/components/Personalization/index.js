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
import { hideContainers, showContainers } from "./flicker";
import { string, boolean } from "../../utils/configValidators";

const DECISIONS_HANDLE = "personalization:decisions";
const SESSION_ID_COOKIE = "SID";
const SESSION_ID_TTL_IN_MINUTES = 31 * 60 * 1000;
const EVENT_COMMAND = "event";

const getOrCreateSessionId = cookieJar => {
  let cookieValue = cookieJar.get(SESSION_ID_COOKIE);
  const now = Date.now();
  const expires = now + SESSION_ID_TTL_IN_MINUTES;

  if (!cookieValue || now > cookieValue.expires) {
    cookieValue = { value: uuid(), expires };
  } else {
    cookieValue.expires = expires;
  }

  // We have to extend session ID lifetime
  cookieJar.set(SESSION_ID_COOKIE, cookieValue);

  return cookieValue.value;
};

const executeFragments = (fragments, modules, logger) => {
  fragments.forEach(fragment => {
    const { rules = [] } = fragment;

    if (isNonEmptyArray(rules)) {
      executeRules(rules, modules, logger);
    }
  });
};

const createCollect = collect => {
  return payload =>
    collect({
      meta: {
        personalization: Object.assign({}, payload)
      }
    });
};

const createPersonalization = ({ config, logger, cookieJar }) => {
  const { authoringModeEnabled, prehidingStyle } = config;
  let ruleComponentModules;
  let optIn;

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { componentRegistry } = tools;
        ({ optIn } = tools);
        const collect = componentRegistry.getCommand(EVENT_COMMAND);
        ruleComponentModules = initRuleComponentModules(createCollect(collect));
      },
      onBeforeEvent({ event, isViewStart }) {
        if (authoringModeEnabled) {
          logger.warn("Rendering is disabled, authoring mode.");

          event.mergeQuery({ personalization: { enabled: false } });

          return Promise.resolve();
        }

        if (!isViewStart) {
          // If NOT isViewStart disable personalization
          event.mergeQuery({ personalization: { enabled: false } });
        } else {
          event.expectResponse();

          // For viewStart we try to hide the personalization containers
          hideContainers(prehidingStyle);
        }

        return optIn.whenOptedIn().then(() => {
          const sessionId = getOrCreateSessionId(cookieJar);

          // Session ID is required both for data fetching and
          // data collection call
          event.mergeMeta({ personalization: { sessionId } });
        });
      },
      onResponse({ response }) {
        if (authoringModeEnabled) {
          return;
        }

        const fragments = response.getPayloadsByType(DECISIONS_HANDLE);

        executeFragments(fragments, ruleComponentModules, logger);

        showContainers();
      },
      onResponseError() {
        showContainers();
      }
    }
  };
};

createPersonalization.namespace = "Personalization";
createPersonalization.abbreviation = "PE";

createPersonalization.configValidators = {
  prehidingStyle: {
    defaultValue: undefined,
    validate: string().nonEmpty()
  },
  authoringModeEnabled: {
    defaultValue: false,
    validate: boolean()
  }
};

export default createPersonalization;
