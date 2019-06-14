import buildRuleExecutionOrder from "./buildRuleExecutionOrder";

const isConditionMet = (condition, result) => {
  return (result && !condition.negate) || (!result && condition.negate);
};

export default (rules, ruleComponentModules, logger) => {
  const lastPromiseInQueue = Promise.resolve();
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
    return `Failed to execute ${ruleComponent.moduleType} for ${
      rule.name
    } rule. ${errorMessage} ${errorStack ? `\n ${errorStack}` : ""}`;
  };

  const logActionError = (action, rule, e) => {
    logger.error(getErrorMessage(action, rule, e.message, e.stack));
  };

  const logConditionError = (condition, rule, e) => {
    logger.error(getErrorMessage(condition, rule, e.message, e.stack));
  };

  const logConditionNotMet = (condition, rule) => {
    logger.log(
      `Condition ${condition.moduleType} for rule ${rule.name} not met.`
    );
  };

  const logRuleCompleted = rule => {
    logger.log(`Rule ${rule.name} fired.`);
  };

  const runActions = (rule, syntheticEvent) => {
    if (!rule.actions) {
      return;
    }

    let action;

    for (let i = 0; i < rule.actions.length; i += 1) {
      action = rule.actions[i];

      try {
        executeModule(action.moduleType, [action.settings, syntheticEvent]);
      } catch (e) {
        logActionError(action, rule, e);
        return;
      }
    }

    logRuleCompleted(rule);
  };

  const checkConditions = (rule, syntheticEvent) => {
    if (!rule.conditions) {
      return;
    }

    let condition;

    for (let i = 0; i < rule.conditions.length; i += 1) {
      condition = rule.conditions[i];

      try {
        const result = executeModule(condition.moduleType, [
          condition.settings,
          syntheticEvent
        ]);

        if (!isConditionMet(condition, result)) {
          logConditionNotMet(condition, rule);
          return;
        }
      } catch (e) {
        logConditionError(condition, rule, e);
        return;
      }
    }

    runActions(rule, syntheticEvent);
  };

  const initEventModule = ruleEventPair => {
    const { rule, event } = ruleEventPair;

    try {
      const trigger = syntheticEvent => {
        if (!eventModulesInitialized) {
          triggerCallQueue.push(trigger.bind(null, syntheticEvent));
          return;
        }

        checkConditions(rule, syntheticEvent);
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

  return lastPromiseInQueue;
};
