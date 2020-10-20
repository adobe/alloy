import { includes } from "../../utils";
import PAGE_WIDE_SCOPE from "./constants/scope";
import {
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM
} from "./constants/schema";

const getScopes = decisionScopes => {
  const scopes = [...decisionScopes];

  if (!includes(scopes, PAGE_WIDE_SCOPE)) {
    scopes.push(PAGE_WIDE_SCOPE);
  }

  return scopes;
};

export default ({ renderDecisions, decisionScopes, event }) => {
  const xdm = event.toJSON().xdm;
  return {
    isRenderDecisions() {
      return renderDecisions;
    },
    getDecisionScopes() {
      return getScopes(decisionScopes);
    },
    getViewName() {
      if (!xdm) {
        return undefined;
      }

      const web = xdm.web;

      if (!web) {
        return undefined;
      }

      const webPageDetails = web.webPageDetails;

      if (!webPageDetails) {
        return undefined;
      }

      return webPageDetails.viewName;
    },
    hasScopes() {
      return decisionScopes.length > 0;
    },
    createQueryDetails() {
      const schemas = [
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        DOM_ACTION
      ];

      return {
        schemas,
        decisionScopes: getScopes(decisionScopes)
      };
    }
  };
};
