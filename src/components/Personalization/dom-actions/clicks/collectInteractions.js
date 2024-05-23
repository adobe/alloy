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

import { VIEW_SCOPE_TYPE } from "../../constants/scopeType.js";
import getAttribute from "../dom/getAttribute.js";
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  CLICK_TOKEN_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE,
} from "../../handlers/createDecorateProposition.js";
import { cleanMetas } from "../../utils/metaUtils.js";
import {
  ALWAYS,
  DECORATED_ELEMENTS_ONLY,
} from "../../../../constants/propositionInteractionType.js";

const getInteractionDetail = (clickedElement) => {
  const { documentElement } = document;
  let element = clickedElement;

  const interactIds = new Set();
  let clickLabel;
  let clickToken;

  while (element && element !== documentElement) {
    const interactId = getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE);

    if (interactId) {
      interactIds.add(interactId);
    }

    clickLabel =
      clickLabel || getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE);

    clickToken =
      clickToken || getAttribute(element, CLICK_TOKEN_DATA_ATTRIBUTE);

    element = element.parentNode;
  }

  return { interactIds: [...interactIds], clickLabel, clickToken };
};

const extractViewName = (metas) => {
  const foundMetaWithScopeTypeView = metas.find(
    (meta) => meta.scopeType === VIEW_SCOPE_TYPE,
  );

  return foundMetaWithScopeTypeView
    ? foundMetaWithScopeTypeView.scope
    : undefined;
};

const createMetaFilter =
  (autoCollectPropositionInteractions, clickLabel, clickToken) => (meta) => {
    const { scopeDetails = {} } = meta;
    const { decisionProvider } = scopeDetails;
    if (autoCollectPropositionInteractions[decisionProvider] === ALWAYS) {
      return true;
    }

    return (
      autoCollectPropositionInteractions[decisionProvider] ===
        DECORATED_ELEMENTS_ONLY &&
      (clickLabel || clickToken)
    );
  };

export default (
  clickedElement,
  getInteractionMetas,
  autoCollectPropositionInteractions,
) => {
  const {
    interactIds,
    clickLabel = "",
    clickToken,
  } = getInteractionDetail(clickedElement);

  const metasMatchingConfigurationOptions = createMetaFilter(
    autoCollectPropositionInteractions,
    clickLabel,
    clickToken,
  );

  if (interactIds.length === 0) {
    return {};
  }

  const metas = getInteractionMetas(interactIds).filter(
    metasMatchingConfigurationOptions,
  );

  return {
    decisionsMeta: cleanMetas(metas),
    propositionActionLabel: clickLabel,
    propositionActionToken: clickToken,
    viewName: extractViewName(metas),
  };
};
