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

const buildRuleExecutionOrder = rules => {
  const ruleEventPairs = [];

  rules.forEach(rule => {
    const { events } = rule;

    events.forEach(event => {
      ruleEventPairs.push({ rule, event });
    });
  });

  return ruleEventPairs;
};

export default (rules, ruleComponentModules, logger) => {
  let eventModulesInitialized = false;
  let triggerCallQueue = [];

  const executeModule = (moduleType, args) => {
    const ruleComponentModule = ruleComponentModules[moduleType];

    if (!ruleComponentModule) {
      throw new Error(`Rule component module "${moduleType}" not found`);
    }

    return ruleComponentModule(...args);
  };

  const getErrorMessage = (ruleComponent, rule, errorMessage, errorStack) => {
    const ruleRespresentation = JSON.stringify(rule);

    return `Failed to execute ${
      ruleComponent.moduleType
    } for ${ruleRespresentation} rule.
    ${errorMessage} ${errorStack ? `\n ${errorStack}` : ""}`;
  };

  const logActionError = (action, rule, e) => {
    logger.error(getErrorMessage(action, rule, e.message, e.stack));
  };

  const logRuleCompleted = rule => {
    const ruleRespresentation = JSON.stringify(rule);

    logger.log(`Rule ${ruleRespresentation} fired.`);
  };

  const runActions = (rule, syntheticEvent) => {
    if (!rule.actions) {
      return;
    }

    for (let i = 0; i < rule.actions.length; i += 1) {
      const action = rule.actions[i];

      try {
        executeModule(action.moduleType, [action.settings, syntheticEvent]);
      } catch (e) {
        logActionError(action, rule, e);
        return;
      }
    }

    logRuleCompleted(rule);
  };

  const initEventModule = ruleEventPair => {
    const { rule, event } = ruleEventPair;

    try {
      const trigger = syntheticEvent => {
        if (!eventModulesInitialized) {
          triggerCallQueue.push(trigger.bind(null, syntheticEvent));
          return;
        }

        runActions(rule, syntheticEvent);
      };

      executeModule(event.moduleType, [event.settings, trigger]);
    } catch (e) {
      logger.error(getErrorMessage(event, rule, e.message, e.stack));
    }
  };

  buildRuleExecutionOrder(rules).forEach(initEventModule);
  eventModulesInitialized = true;
  triggerCallQueue.forEach(triggerCall => triggerCall());
  triggerCallQueue = null;
};
