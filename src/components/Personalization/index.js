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
import { hideContainers, showContainers } from "./flicker";
import { string, boolean } from "../../utils/configValidators";

const DECISIONS_HANDLE = "personalization:decisions";
const EVENT_COMMAND = "event";

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

const createPersonalization = ({ config, logger }) => {
  const { authoringModeEnabled, prehidingStyle } = config;
  let ruleComponentModules;

  return {
    lifecycle: {
      onComponentsRegistered(tools) {
        const { componentRegistry } = tools;
        const collect = componentRegistry.getCommand(EVENT_COMMAND);
        ruleComponentModules = initRuleComponentModules(createCollect(collect));
      },
      onBeforeEvent({ event, isViewStart }) {
        if (authoringModeEnabled) {
          logger.warn("Rendering is disabled, authoring mode.");

          event.mergeQuery({ personalization: { enabled: false } });
        }

        if (!isViewStart) {
          // If NOT isViewStart disable personalization
          event.mergeQuery({ personalization: { enabled: false } });
        } else {
          event.expectResponse();

          // For viewStart we try to hide the personalization containers
          hideContainers(prehidingStyle);
        }
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
