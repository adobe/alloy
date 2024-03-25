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
import { ADOBE_JOURNEY_OPTIMIZER } from "../../../src/constants/decisionProvider";
import createInteractionStorage from "../../../src/components/Personalization/createInteractionStorage";
import createDecorateProposition from "../../../src/components/Personalization/handlers/createDecorateProposition";

export default ({
  autoTrackPropositionInteractions = [ADOBE_JOURNEY_OPTIMIZER],
  type,
  propositionId = "propositionID",
  itemId = "itemId",
  trackingLabel = "trackingLabel",
  scopeType = "page",
  notification = {
    id: "notifyId",
    scope: "web://mywebsite.com",
    scopeDetails: { something: true, decisionProvider: ADOBE_JOURNEY_OPTIMIZER }
  }
} = {}) => {
  const { storeInteractionMeta } = createInteractionStorage();
  return createDecorateProposition(
    autoTrackPropositionInteractions,
    type,
    propositionId,
    itemId,
    trackingLabel,
    scopeType,
    notification,
    storeInteractionMeta
  );
};
