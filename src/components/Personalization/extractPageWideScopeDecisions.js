import PAGE_WIDE_SCOPE from "./constants/scope";
import isNonEmptyArray from "../../utils/isNonEmptyArray";

const isPageWideScope = decision => decision.scope === PAGE_WIDE_SCOPE;

const extractDecisions = decisions => {
  const pageWideDecisions = [];
  const viewDecisions = {};

  if (isNonEmptyArray(decisions)) {
    decisions.forEach(decision => {
      if (isPageWideScope(decision)) {
        pageWideDecisions.push(decision);
      } else {
        if (!viewDecisions[decision.scope]) {
          viewDecisions[decision.scope] = [];
        }
        viewDecisions[decision.scope].push(decision);
      }
    });
  }

  return [pageWideDecisions, viewDecisions];
};

export default renderableDecisions => {
  return extractDecisions(renderableDecisions);
};
