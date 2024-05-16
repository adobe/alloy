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

export default ({
  mergeDecisionsMeta,
  collectInteractions,
  collectClicks,
  getInteractionMetas,
  getClickMetas,
  getClickSelectors,
  autoCollectPropositionInteractions
}) => {
  // Called when an element qualifying for conversion within an offer is clicked.
  return ({ event, clickedElement }) => {
    const decisionsMeta = [];
    let propositionActionLabel;
    let propositionActionToken;
    let viewName;

    [
      collectInteractions(
        clickedElement,
        getInteractionMetas,
        autoCollectPropositionInteractions
      ),
      collectClicks(clickedElement, getClickSelectors(), getClickMetas)
    ].forEach(
      ({
        decisionsMeta: curDecisionsMeta,
        propositionActionLabel: curPropositionActionLabel,
        propositionActionToken: curPropositionActionToken,
        viewName: curViewName
      }) => {
        Array.prototype.push.apply(decisionsMeta, curDecisionsMeta);

        if (!propositionActionLabel && curPropositionActionLabel) {
          propositionActionLabel = curPropositionActionLabel;
        }

        if (!propositionActionToken && curPropositionActionToken) {
          propositionActionToken = curPropositionActionToken;
        }

        if (!viewName && curViewName) {
          viewName = curViewName;
        }
      }
    );

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
