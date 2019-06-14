import normalizeSyntheticEvent from "./normalizeSynctheticEvent";
import createExecuteDelegateModule from "./createExecuteDelegateModule";
import buildRuleExecutionOrder from "./buildRuleExecutionOrder";

const getModuleDisplayNameByRuleComponent = (moduleProvider, ruleComponent) => {
  const moduleDefinition = moduleProvider.getModuleDefinition(
    ruleComponent.modulePath
  );

  return (
    (moduleDefinition && moduleDefinition.displayName) ||
    ruleComponent.modulePath
  );
};

const isConditionMet = (condition, result) => {
  return (result && !condition.negate) || (!result && condition.negate);
};

export default (rules, moduleProvider, logger) => {
  const lastPromiseInQueue = Promise.resolve();
  const executeDelegateModule = createExecuteDelegateModule(moduleProvider);
  let eventModulesInitialized = false;
  let triggerCallQueue = [];

  const getErrorMessage = (ruleComponent, rule, errorMessage, errorStack) => {
    const moduleDisplayName = getModuleDisplayNameByRuleComponent(
      moduleProvider,
      ruleComponent
    );

    return `Failed to execute ${moduleDisplayName} for ${
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
    const conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

    logger.log(
      `Condition ${conditionDisplayName} for rule ${rule.name} not met.`
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
        executeDelegateModule(action, syntheticEvent, [syntheticEvent]);
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
        const result = executeDelegateModule(condition, syntheticEvent, [
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
    event.settings = event.settings || {};

    let moduleName;
    let extensionName;

    try {
      moduleName = moduleProvider.getModuleDefinition(event.modulePath).name;
      extensionName = moduleProvider.getModuleExtensionName(event.modulePath);

      const syntheticEventMeta = {
        $type: `${extensionName}.${moduleName}`,
        $rule: {
          id: rule.id,
          name: rule.name
        }
      };

      const trigger = syntheticEvent => {
        if (!eventModulesInitialized) {
          triggerCallQueue.push(trigger.bind(null, syntheticEvent));
          return;
        }

        const normalizedSyntheticEvent = normalizeSyntheticEvent(
          syntheticEventMeta,
          syntheticEvent
        );

        checkConditions(rule, normalizedSyntheticEvent);
      };

      executeDelegateModule(event, null, [trigger]);
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
