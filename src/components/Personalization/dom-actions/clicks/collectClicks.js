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

import matchesSelectorWithEq from "../dom/matchesSelectorWithEq";
import document from "../../../../utils/document";

const getMetasIfMatches = (
  clickedElement,
  selector,
  getClickMetasBySelector
) => {
  const { documentElement } = document;
  let element = clickedElement;
  let i = 0;

  while (element && element !== documentElement) {
    if (matchesSelectorWithEq(selector, element)) {
      const matchedMetas = getClickMetasBySelector(selector);
      const foundMetaWithLabel = matchedMetas.find(meta => meta.trackingLabel);
      if (foundMetaWithLabel) {
        return {
          metas: matchedMetas,
          label: foundMetaWithLabel.trackingLabel,
          weight: i
        };
      }
      return {
        metas: matchedMetas
      };
    }

    element = element.parentNode;
    i += 1;
  }

  return {
    metas: null
  };
};

const cleanMetas = metas =>
  metas.map(meta => {
    delete meta.trackingLabel;
    return meta;
  });

const dedupMetas = metas =>
  metas.filter((meta, index) => {
    const stringifiedMeta = JSON.stringify(meta);
    return (
      index ===
      metas.findIndex(
        innerMeta => JSON.stringify(innerMeta) === stringifiedMeta
      )
    );
  });

export default (clickedElement, selectors, getClickMetasBySelector) => {
  const result = [];
  let resultLabel = "";
  let resultLabelWeight = Number.MAX_SAFE_INTEGER;

  /* eslint-disable no-continue */
  for (let i = 0; i < selectors.length; i += 1) {
    const { metas, label, weight } = getMetasIfMatches(
      clickedElement,
      selectors[i],
      getClickMetasBySelector
    );

    if (!metas) {
      continue;
    }

    if (label && weight <= resultLabelWeight) {
      resultLabel = label;
      resultLabelWeight = weight;
    }
    result.push(...cleanMetas(metas));
  }

  return {
    decisionsMeta: dedupMetas(result),
    eventLabel: resultLabel
  };
};
