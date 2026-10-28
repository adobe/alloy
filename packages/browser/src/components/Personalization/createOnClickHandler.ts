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

import type { Event } from "@adobe/alloy-core/core/types.js";
import type { mergeDecisionsMeta as mergeDecisionsMetaFn } from "@adobe/alloy-core/utils/event.js";
import type collectInteractionsFn from "./dom-actions/clicks/collectInteractions.js";
import type collectClicksFn from "./dom-actions/clicks/collectClicks.js";
import type {
  AutoCollectPropositionInteractions,
  DecisionMeta,
  GetClickMetas,
  GetInteractionMetas,
  PropositionAction,
} from "./types.js";

import { isNonEmptyArray } from "@adobe/alloy-core/utils";
import { INTERACT } from "@adobe/alloy-core/constants/eventType.js";
import { PropositionEventType } from "@adobe/alloy-core/constants/propositionEventType.js";

const createPropositionAction = (
  clickLabel: string | null | undefined,
  clickToken: string | null | undefined,
) => {
  if (!clickToken && !clickLabel) {
    return undefined;
  }

  const propositionAction: PropositionAction = {};

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
  autoCollectPropositionInteractions,
}: {
  mergeDecisionsMeta: typeof mergeDecisionsMetaFn;
  collectInteractions: typeof collectInteractionsFn;
  collectClicks: typeof collectClicksFn;
  getInteractionMetas: GetInteractionMetas;
  getClickMetas: GetClickMetas;
  getClickSelectors: () => string[];
  autoCollectPropositionInteractions: AutoCollectPropositionInteractions;
}) => {
  // Called when an element qualifying for conversion within an offer is clicked.
  return ({
    event,
    clickedElement,
  }: {
    event: Event;
    clickedElement: Node | null;
  }) => {
    const decisionsMeta: DecisionMeta[] = [];
    let propositionActionLabel: string | null | undefined;
    let propositionActionToken: string | null | undefined;
    let viewName: string | undefined;

    [
      collectInteractions(
        clickedElement,
        getInteractionMetas,
        autoCollectPropositionInteractions,
      ),
      collectClicks(clickedElement, getClickSelectors(), getClickMetas),
    ].forEach(
      ({
        decisionsMeta: curDecisionsMeta,
        propositionActionLabel: curPropositionActionLabel,
        propositionActionToken: curPropositionActionToken,
        viewName: curViewName,
      }) => {
        decisionsMeta.push(...(curDecisionsMeta ?? []));

        if (!propositionActionLabel && curPropositionActionLabel) {
          propositionActionLabel = curPropositionActionLabel;
        }

        if (!propositionActionToken && curPropositionActionToken) {
          propositionActionToken = curPropositionActionToken;
        }

        if (!viewName && curViewName) {
          viewName = curViewName;
        }
      },
    );

    if (isNonEmptyArray(decisionsMeta)) {
      const xdm: Record<string, unknown> = { eventType: INTERACT };

      if (viewName) {
        xdm.web = {
          webPageDetails: {
            viewName,
          },
        };
      }

      event.mergeXdm(xdm);

      mergeDecisionsMeta(
        event,
        decisionsMeta,
        [PropositionEventType.INTERACT],
        createPropositionAction(propositionActionLabel, propositionActionToken),
      );
    }
  };
};
