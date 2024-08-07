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

import { isNonEmptyString, isNonEmptyArray } from "../../utils/index.js";
import { buildPageSurface, normalizeSurfaces } from "./utils/surfaceUtils.js";
import PAGE_WIDE_SCOPE from "../../constants/pageWideScope.js";
import {
  DEFAULT_CONTENT_ITEM,
  DOM_ACTION,
  HTML_CONTENT_ITEM,
  MESSAGE_IN_APP,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM,
  RULESET_ITEM,
  MESSAGE_CONTENT_CARD,
} from "../../constants/schema.js";

const addPageWideScope = (scopes) => {
  if (!scopes.includes(PAGE_WIDE_SCOPE)) {
    scopes.push(PAGE_WIDE_SCOPE);
  }
};

const addPageSurface = (surfaces, getPageLocation) => {
  const pageSurface = buildPageSurface(getPageLocation);
  if (!surfaces.includes(pageSurface)) {
    surfaces.push(pageSurface);
  }
};

const dedupe = (array) =>
  array.filter((item, pos) => array.indexOf(item) === pos);

export default ({
  getPageLocation,
  renderDecisions,
  decisionScopes,
  personalization,
  event,
  isCacheInitialized,
  logger,
}) => {
  const viewName = event.getViewName();
  return {
    isRenderDecisions() {
      return renderDecisions;
    },
    isSendDisplayEvent() {
      return !!personalization.sendDisplayEvent;
    },
    shouldIncludeRenderedPropositions() {
      return !!personalization.includeRenderedPropositions;
    },
    getViewName() {
      return viewName;
    },
    hasScopes() {
      return (
        decisionScopes.length > 0 ||
        isNonEmptyArray(personalization.decisionScopes)
      );
    },
    hasSurfaces() {
      return isNonEmptyArray(personalization.surfaces);
    },
    hasViewName() {
      return isNonEmptyString(viewName);
    },
    createQueryDetails() {
      const scopes = [...decisionScopes];
      if (isNonEmptyArray(personalization.decisionScopes)) {
        scopes.push(...personalization.decisionScopes);
      }
      const eventSurfaces = normalizeSurfaces(
        personalization.surfaces,
        getPageLocation,
        logger,
      );

      if (this.shouldRequestDefaultPersonalization()) {
        addPageWideScope(scopes);
        addPageSurface(eventSurfaces, getPageLocation);
      }

      const schemas = [
        DEFAULT_CONTENT_ITEM,
        HTML_CONTENT_ITEM,
        JSON_CONTENT_ITEM,
        REDIRECT_ITEM,
        RULESET_ITEM,
        MESSAGE_IN_APP,
        MESSAGE_CONTENT_CARD,
      ];

      if (scopes.includes(PAGE_WIDE_SCOPE)) {
        schemas.push(DOM_ACTION);
      }

      return {
        schemas,
        decisionScopes: dedupe(scopes),
        surfaces: dedupe(eventSurfaces),
      };
    },
    isCacheInitialized() {
      return isCacheInitialized;
    },
    shouldFetchData() {
      return (
        this.hasScopes() ||
        this.hasSurfaces() ||
        this.shouldRequestDefaultPersonalization()
      );
    },
    shouldUseCachedData() {
      return this.hasViewName() && !this.shouldFetchData();
    },
    shouldRequestDefaultPersonalization() {
      return (
        personalization.defaultPersonalizationEnabled ||
        (!this.isCacheInitialized() &&
          personalization.defaultPersonalizationEnabled !== false)
      );
    },
  };
};
