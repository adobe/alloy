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

import { EVENT_TYPE_TRUE } from "../constants/eventType.js";
import type { Event } from "./types.js";

/** One rendered proposition, as reported in `_experience.decisioning.propositions`. */
export interface DecisionMeta {
  id?: string;
  scope?: string;
  // Opaque server-provided details, echoed back to Edge unchanged.
  scopeDetails?: Record<string, unknown>;
}

export type DecisionsMeta = DecisionMeta[];

/** `_experience.decisioning.propositionAction`: what the user interacted with. */
export interface PropositionAction {
  id?: string;
  label?: string;
  tokens?: string[];
  reason?: string;
}

/** The `_experience.decisioning` XDM sent with proposition notifications. */
export interface Decisioning {
  propositions: DecisionsMeta;
  propositionEventType: Record<string, typeof EVENT_TYPE_TRUE>;
  propositionAction?: PropositionAction;
}

export const mergeDecisionsMeta = (
  event: Event,
  decisionsMeta: DecisionsMeta,
  propositionEventTypes: string[],
  propositionAction?: PropositionAction,
) => {
  // Do not send a display notification with no decisions. Even empty view changes
  // should include a proposition.
  if (decisionsMeta.length === 0) {
    return;
  }
  const propositionEventType: Decisioning["propositionEventType"] = {};

  propositionEventTypes.forEach((type) => {
    propositionEventType[type] = EVENT_TYPE_TRUE;
  });

  const xdm: { _experience: { decisioning: Decisioning } } = {
    _experience: {
      decisioning: {
        propositions: decisionsMeta,
        propositionEventType,
      },
    },
  };

  if (propositionAction) {
    xdm._experience.decisioning.propositionAction = propositionAction;
  }
  event.mergeXdm(xdm);
};

export const mergeQuery = (event: Event, details: object) => {
  event.mergeQuery({ personalization: { ...details } });
};
