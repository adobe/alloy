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
import type {
  AutoCollectPropositionInteractions,
  ClickMeta,
  GetInteractionMetas,
  InteractionResult,
} from "../../types.js";
import {
  ALWAYS,
  DECORATED_ELEMENTS_ONLY,
} from "@adobe/alloy-core/constants/propositionInteractionType.js";

const getInteractionDetail = (clickedElement: Node | null) => {
  const { documentElement } = document;
  let element: Node | null = clickedElement;

  const interactIds = new Set<string>();
  let clickLabel: string | null | undefined;
  let clickToken: string | null | undefined;

  while (
    element &&
    element !== documentElement &&
    !(element instanceof ShadowRoot)
  ) {
    const interactId = getAttribute(
      element as Element,
      INTERACT_ID_DATA_ATTRIBUTE,
    );

    if (interactId) {
      interactIds.add(interactId);
    }

    clickLabel =
      clickLabel ||
      getAttribute(element as Element, CLICK_LABEL_DATA_ATTRIBUTE);

    clickToken =
      clickToken ||
      getAttribute(element as Element, CLICK_TOKEN_DATA_ATTRIBUTE);

    element = element.parentNode;
  }

  return { interactIds: [...interactIds], clickLabel, clickToken };
};

const extractViewName = (metas: ClickMeta[]) => {
  const foundMetaWithScopeTypeView = metas.find(
    (meta) => meta.scopeType === VIEW_SCOPE_TYPE,
  );

  return foundMetaWithScopeTypeView
    ? foundMetaWithScopeTypeView.scope
    : undefined;
};

const createMetaFilter =
  (
    autoCollectPropositionInteractions: AutoCollectPropositionInteractions,
    clickLabel: string | null,
    clickToken: string | null | undefined,
  ) =>
  (meta: ClickMeta) => {
    const { scopeDetails = {} } = meta;
    // A meta without a provider finds no setting, as an undefined key never matches.
    const decisionProvider = scopeDetails.decisionProvider as string;
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
  clickedElement: Node | null,
  getInteractionMetas: GetInteractionMetas,
  autoCollectPropositionInteractions: AutoCollectPropositionInteractions,
): InteractionResult => {
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
