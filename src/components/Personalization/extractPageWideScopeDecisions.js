import { PAGE_WIDE_SCOPE } from "./utils";

const isPageWideScope = decision => decision.scope === PAGE_WIDE_SCOPE;

const storeDecisions = (pushView, decisions) => {
  Object.keys(decisions).forEach(scope => {
    pushView(scope, decisions[scope]);
  });
};
const extractDecisions = (decisions, pushView) => {
  const pageWideDecisions = [];
  const viewDecisions = {};

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
  storeDecisions(pushView, viewDecisions);

  return pageWideDecisions;
};

export default (decisions, pushView) => {
  return extractDecisions(decisions, pushView);
};
