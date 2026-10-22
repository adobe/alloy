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
import { DISPLAY } from "../constants/eventType.js";
import { getPropositionEventType } from "../constants/propositionEventType.js";
import { isNonEmptyArray } from "./index.js";

import type { Event } from "./types.js";
import type { DecisionsMeta, PropositionAction } from "./event.js";

/** XDM identityMap: namespace to identities. */
type IdentityMap = Record<
  string,
  { id: string; authenticatedState?: string; primary?: boolean }[]
>;

interface CollectOptions {
  decisionsMeta?: DecisionsMeta;
  propositionAction?: PropositionAction;
  documentMayUnload?: boolean;
  eventType?: string;
  propositionEventTypes?: (string | undefined)[];
  viewName?: string;
  identityMap?: IdentityMap;
}

export default <R = unknown>({
  eventManager,
  mergeDecisionsMeta,
}: {
  eventManager: {
    createEvent: () => Event;
    sendEvent: (event: Event) => Promise<R>;
  };
  mergeDecisionsMeta: (
    event: Event,
    decisionsMeta: DecisionsMeta,
    propositionEventTypes: (string | undefined)[],
    propositionAction: PropositionAction | undefined,
  ) => void;
}) => {
  // Called when a decision is auto-rendered for the __view__ scope or a SPA view(display and empty display notification)
  return ({
    decisionsMeta = [],
    propositionAction,
    documentMayUnload = false,
    eventType = DISPLAY,
    propositionEventTypes = [getPropositionEventType(eventType)],
    viewName,
    identityMap,
  }: CollectOptions) => {
    const event = eventManager.createEvent();
    const data: Record<string, unknown> = { eventType, identityMap };

    if (viewName) {
      data.web = {
        webPageDetails: { viewName },
      };
    }
    if (isNonEmptyArray(decisionsMeta)) {
      mergeDecisionsMeta(
        event,
        decisionsMeta,
        propositionEventTypes,
        propositionAction,
      );
    }

    event.mergeXdm(data);

    if (documentMayUnload) {
      event.documentMayUnload();
    }

    return eventManager.sendEvent(event);
  };
};
