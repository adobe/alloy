import { DEFAULT_CONTENT_ITEM, DOM_ACTION } from "../constants/schema";
import PAGE_WIDE_SCOPE from "../../../constants/pageWideScope";
import { VIEW_SCOPE_TYPE } from "../constants/scopeType"

export default ({ next, executeDecisions, isPageWideSurface }) => args => {
  const { proposition, viewName } = args;
  const {
    scope,
    scopeDetails: {
      characteristics: {
        scopeType
      }
    },
    items
  } = proposition.getHandle();

  if (scope === PAGE_WIDE_SCOPE || isPageWideSurface(scope) ||
    scopeType === VIEW_SCOPE_TYPE && scope === viewName) {

    if (items.some(({ schema }) => schema === DOM_ACTION || schema === DEFAULT_CONTENT_ITEM )) {
      proposition.addRenderer(() => {
        return executeDecisions([proposition.getHandle()]);
      });
    }
  }
  // this proposition may contain items that need to be rendered or cached by other handlers.
  next(args);
};
