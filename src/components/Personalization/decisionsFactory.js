import { assign, groupBy, isNonEmptyArray, values } from "../../utils";
import * as SCHEMAS from "../../constants/schemas";
import { executeActions } from "./turbine";

const buildActions = (decision, items) => {
  const meta = { decisionId: decision.id };

  return items.map(item => assign({}, item.data, { meta }));
};

const isNotDomAction = item => item.schema !== SCHEMAS.DOM_ACTION;

export const DECISIONS_HANDLE = "personalization:decisions";
export const PAGE_WIDE_SCOPE = "__view__";
export const allSchemas = values(SCHEMAS);

export const hasScopes = decisionScopes => isNonEmptyArray(decisionScopes);

export const getDecisions = payload =>
  payload.getPayloadsByType(DECISIONS_HANDLE);

export const executeDecisions = (decisions, modules, logger) => {
  decisions.forEach(decision => {
    const group = groupBy(decision.items, item => item.schema);
    const items = group[SCHEMAS.DOM_ACTION];

    if (isNonEmptyArray(items)) {
      const actions = buildActions(decision, items);

      executeActions(actions, modules, logger);
    }
  });
};

export const filterDecisionsItemsBySchema = decisions => {
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
