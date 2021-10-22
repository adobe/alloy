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
import isNonEmptyString from "../../utils/isNonEmptyString";
import qaModeHelper from "./utils/qaModeHelper";

export default ({ renderDecisions, decisionScopes, event, viewCache }) => {
  const viewName = event.getViewName();
  return {
    isRenderDecisions() {
      return renderDecisions;
    },
    getViewName() {
      return viewName;
    },
    hasScopes() {
      return decisionScopes.length > 0;
    },
    hasViewName() {
      return isNonEmptyString(viewName);
    },
    createQueryDetails() {
      const scopes = [...decisionScopes];
      if (!this.isCacheInitialized() && !includes(scopes, PAGE_WIDE_SCOPE)) {
        scopes.push(PAGE_WIDE_SCOPE);
      }

      const schemas = [HTML_CONTENT_ITEM, JSON_CONTENT_ITEM, REDIRECT_ITEM];

      if (includes(scopes, PAGE_WIDE_SCOPE)) {
        schemas.push(DOM_ACTION);
      }

      const queryDetails = {
        schemas,
        decisionScopes: scopes
      };

      const qaMode = qaModeHelper.getQaMode(window.location.search);
      if (qaMode) {
        queryDetails.qaMode = qaMode;
      }

      return queryDetails;
    },
    isCacheInitialized() {
      return viewCache.isInitialized();
    },
    shouldFetchData() {
      return this.hasScopes() || !this.isCacheInitialized();
    },
    shouldUseCachedData() {
      return this.hasViewName() && this.isCacheInitialized();
    }
  };
};
