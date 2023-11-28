/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { DISPLAY, INTERACT, TRIGGER, DISMISS } from "./eventType";

export const PropositionEventType = {
  DISPLAY: "display",
  INTERACT: "interact",
  TRIGGER: "trigger",
  DISMISS: "dismiss"
};

const eventTypeToPropositionEventTypeMapping = {
  [DISPLAY]: PropositionEventType.DISPLAY,
  [INTERACT]: PropositionEventType.INTERACT,
  [TRIGGER]: PropositionEventType.TRIGGER,
  [DISMISS]: PropositionEventType.DISMISS
};
const propositionEventTypeToEventTypeMapping = {
  [PropositionEventType.DISPLAY]: DISPLAY,
  [PropositionEventType.INTERACT]: INTERACT,
  [PropositionEventType.TRIGGER]: TRIGGER,
  [PropositionEventType.DISMISS]: DISMISS
};

export const getPropositionEventType = eventType =>
  eventTypeToPropositionEventTypeMapping[eventType];

export const getEventType = propositionEventType =>
  propositionEventTypeToEventTypeMapping[propositionEventType];
