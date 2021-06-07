import {
  FAILED_TO_RENDER,
  NON_RENDERABLE,
  NOT_RENDERED,
  PARTIALLY_RENDERED,
  RENDERED,
  SUCCEEDED_TO_RENDER
} from "./constants/decisionStatus";
import includes from "../../utils/includes";
import find from "../../utils/find";
import { assign, flatMap, identity, values } from "../../utils";
import isNonEmptyArray from "../../utils/isNonEmptyArray";

export default () => {
  const isFailed = item => item.renderStatus === FAILED_TO_RENDER;
  const isRendered = item => item.renderStatus === SUCCEEDED_TO_RENDER;

  const getStatus = items => {
    const hasFailure = includes(items, find(items, isFailed));

    if (hasFailure) {
      const hasRendered = includes(items, find(items, isRendered));
      if (hasRendered) {
        return PARTIALLY_RENDERED;
      }
      return FAILED_TO_RENDER;
    }

    return RENDERED;
  };

  const adjustRenderedDecisionsStatus = decisions => {
    Object.keys(decisions).forEach(key => {
      decisions[key].renderStatus = getStatus(decisions[key].items);
    });
  };

  const addRenderedDecisionStatus = (decisions, status) => {
    decisions.forEach(decision => {
      if (!decision) {
        return;
      }
      decision.renderStatus = status;
    });
  };

  const processDecisionsResult = decisions => {
    const flatDecisions = flatMap(decisions, identity);
    const result = {};
    flatDecisions.forEach(element => {
      if (!element) {
        return;
      }
      const elementId = element.meta.id;
      if (!result[elementId]) {
        result[elementId] = {};
        result[elementId].id = elementId;
        result[elementId].scope = element.meta.scope;
        result[elementId].scopeDetails = element.meta.scopeDetails;
        result[elementId].items = [];
      }

      if (element.error) {
        const failedItem = assign(
          {},
          { renderStatus: FAILED_TO_RENDER },
          element.meta.item
        );
        result[elementId].items.push(failedItem);
        return;
      }
      const renderedItem = assign(
        {},
        { renderStatus: SUCCEEDED_TO_RENDER },
        element.meta.item
      );
      result[element.meta.id].items.push(renderedItem);
    });

    adjustRenderedDecisionsStatus(result);

    return values(result);
  };

  const formatDecisions = ({
    executedDecisionsResult = [],
    renderableDecisions = [],
    nonRenderableDecisions = []
  }) => {
    const decisions = [];
    if (isNonEmptyArray(executedDecisionsResult)) {
      decisions.push(processDecisionsResult(executedDecisionsResult));
    }

    if (isNonEmptyArray(renderableDecisions)) {
      addRenderedDecisionStatus(renderableDecisions, NOT_RENDERED);

      decisions.push(...renderableDecisions);
    }
    if (isNonEmptyArray(nonRenderableDecisions)) {
      addRenderedDecisionStatus(nonRenderableDecisions, NON_RENDERABLE);

      decisions.push(...nonRenderableDecisions);
    }
    return flatMap(decisions, identity);
  };

  return {
    formatDecisions,
    addRenderedDecisionStatus
  };
};
