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

import { isNonEmptyArray } from "../../utils";
import { INTERACT } from "../../constants/eventType";
import { PropositionEventType } from "../../constants/propositionEventType";

const createPropositionAction = (clickLabel, clickToken) => {
  if (!clickToken && !clickLabel) {
    return undefined;
  }

  const propositionAction = {};

  if (clickLabel) {
    propositionAction.label = clickLabel;
  }

  if (clickToken) {
    propositionAction.tokens = [clickToken];
  }

  return propositionAction;
};

export default ({ mergeDecisionsMeta, collectClicks, getClickMetas }) => {
  // Called when an element qualifying for conversion within an offer is clicked.
  return ({ event, clickedElement }) => {
    const {
      decisionsMeta,
      propositionActionLabel,
      propositionActionToken,
      viewName
    } = collectClicks(clickedElement, getClickMetas);

    if (isNonEmptyArray(decisionsMeta)) {
      const xdm = { eventType: INTERACT };

      if (viewName) {
        xdm.web = {
          webPageDetails: {
            viewName
          }
        };
      }

      event.mergeXdm(xdm);

      mergeDecisionsMeta(
        event,
        decisionsMeta,
        [PropositionEventType.INTERACT],
        createPropositionAction(propositionActionLabel, propositionActionToken)
      );
    }
  };
};
