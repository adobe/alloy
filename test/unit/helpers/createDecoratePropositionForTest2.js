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
import {
  ADOBE_JOURNEY_OPTIMIZER,
  ADOBE_TARGET,
} from "../../../src/constants/decisionProvider.js";
import createInteractionStorage from "../../../src/components/Personalization/createInteractionStorage.js";
import createDecorateProposition from "../../../src/components/Personalization/handlers/createDecorateProposition.js";
import {
  ALWAYS,
  NEVER,
} from "../../../src/constants/propositionInteractionType.js";

export default ({
  autoCollectPropositionInteractions = {
    [ADOBE_JOURNEY_OPTIMIZER]: ALWAYS,
    [ADOBE_TARGET]: NEVER,
  },
  type,
  propositionId = "propositionID",
  itemId = "itemId",
  trackingLabel = "trackingLabel",
  scopeType = "page",
  notification = {
    id: "notifyId",
    scope: "web://mywebsite.com",
    scopeDetails: {
      something: true,
      decisionProvider: ADOBE_JOURNEY_OPTIMIZER,
    },
  },
} = {}) => {
  const { storeInteractionMeta } = createInteractionStorage();
  return createDecorateProposition(
    autoCollectPropositionInteractions,
    type,
    propositionId,
    itemId,
    trackingLabel,
    scopeType,
    notification,
    storeInteractionMeta,
  );
};
