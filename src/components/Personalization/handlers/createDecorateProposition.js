/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { getAttribute, setAttribute } from "../dom-actions/dom";
import { includes, noop } from "../../../utils";
import { DOM_ACTION_CLICK } from "../dom-actions/initDomActionsModules";
import {
  ALWAYS,
  DECORATED_ELEMENTS_ONLY
} from "../../../constants/propositionInteractionType";

export const INTERACT_ID_DATA_ATTRIBUTE = "data-aep-interact-id";
export const CLICK_LABEL_DATA_ATTRIBUTE = "data-aep-click-label";
export const CLICK_TOKEN_DATA_ATTRIBUTE = "data-aep-click-token";

let lastInteractId = 0;

const getInteractId = (propositionId, existingInteractId) => {
  if (existingInteractId) {
    return parseInt(existingInteractId, 10);
  }

  // eslint-disable-next-line no-plusplus
  return ++lastInteractId;
};

const interactionTrackingSupported = (
  autoCollectPropositionInteractions,
  decisionProvider
) => {
  if (!autoCollectPropositionInteractions) {
    return false;
  }

  if (!autoCollectPropositionInteractions[decisionProvider]) {
    return false;
  }

  return includes(
    [ALWAYS, DECORATED_ELEMENTS_ONLY],
    autoCollectPropositionInteractions[decisionProvider]
  );
};

const createDecorateProposition = (
  autoCollectPropositionInteractions,
  type,
  propositionId,
  itemId,
  trackingLabel,
  scopeType,
  notification,
  storeInteractionMeta
) => {
  const { scopeDetails = {} } = notification;
  const { decisionProvider } = scopeDetails;

  if (
    !interactionTrackingSupported(
      autoCollectPropositionInteractions,
      decisionProvider
    ) &&
    type !== DOM_ACTION_CLICK
  ) {
    return noop;
  }

  return element => {
    if (!element.tagName) {
      return;
    }

    const interactId = getInteractId(
      propositionId,
      getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)
    );

    storeInteractionMeta(
      propositionId,
      itemId,
      scopeType,
      notification,
      interactId
    );

    setAttribute(element, INTERACT_ID_DATA_ATTRIBUTE, interactId);

    if (trackingLabel && !getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)) {
      setAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE, trackingLabel);
    }
  };
};

export default createDecorateProposition;
