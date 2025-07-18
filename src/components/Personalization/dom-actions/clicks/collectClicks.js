/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import matchesSelectorWithEq from "../dom/matchesSelectorWithEq.js";
import { VIEW_SCOPE_TYPE } from "../../constants/scopeType.js";
import { cleanMetas, dedupeMetas } from "../../utils/metaUtils.js";

const getMetasIfMatches = (clickedElement, selector, getClickMetas) => {
  const { documentElement } = document;
  let element = clickedElement;
  let i = 0;

  while (element && element !== documentElement) {
    if (matchesSelectorWithEq(selector, element)) {
      const matchedMetas = getClickMetas(selector);
      const returnValue = {
        metas: matchedMetas,
      };
      const foundMetaWithLabel = matchedMetas.find(
        (meta) => meta.trackingLabel,
      );
      if (foundMetaWithLabel) {
        returnValue.label = foundMetaWithLabel.trackingLabel;
        returnValue.weight = i;
      }
      const foundMetaWithScopeTypeView = matchedMetas.find(
        (meta) => meta.scopeType === VIEW_SCOPE_TYPE,
      );
      if (foundMetaWithScopeTypeView) {
        returnValue.viewName = foundMetaWithScopeTypeView.scope;
        returnValue.weight = i;
      }
      return returnValue;
    }

    element = element.parentNode;
    i += 1;
  }

  return {
    metas: null,
  };
};

export default (clickedElement, selectors, getClickMetas) => {
  const result = [];
  let resultLabel = "";
  let resultLabelWeight = Number.MAX_SAFE_INTEGER;
  let resultViewName;
  let resultViewNameWeight = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < selectors.length; i += 1) {
    const { metas, label, weight, viewName } = getMetasIfMatches(
      clickedElement,
      selectors[i],
      getClickMetas,
    );

    if (!metas) {
      continue;
    }

    if (label && weight <= resultLabelWeight) {
      resultLabel = label;
      resultLabelWeight = weight;
    }
    if (viewName && weight <= resultViewNameWeight) {
      resultViewName = viewName;
      resultViewNameWeight = weight;
    }
    result.push(...cleanMetas(metas));
  }

  return {
    decisionsMeta: dedupeMetas(result),
    propositionActionLabel: resultLabel,
    propositionActionToken: undefined,
    viewName: resultViewName,
  };
};
