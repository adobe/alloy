/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

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
const getViewName = xdm => {
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
};

export default ({ renderDecisions, decisionScopes, event, viewCache }) => {
  const xdm = event.toJSON().xdm;
  const viewName = getViewName(xdm);
  return {
    isRenderDecisions() {
      return renderDecisions;
    },
    getDecisionScopes() {
      return getScopes(decisionScopes);
    },
    getViewName() {
      return viewName;
    },
    hasScopes() {
      return decisionScopes.length > 0;
    },
    hasViewName() {
      return viewName !== undefined;
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
    },
    isCacheInitialized() {
      return viewCache.isInitialized();
    },
    shouldFetchData() {
      return (
        this.hasScopes() ||
        !this.isCacheInitialized() ||
        (!this.hasViewName() && this.isRenderDecisions())
      );
    },
    shouldUseCachedData() {
      return this.hasViewName() && this.isCacheInitialized();
    }
  };
};
