/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export type EventRegistry = Record<string, EventRecord>;

export interface EventPayload {
  operation: string;
  event: EventData;
}

export interface EventData {
  eventType?: string | null;
  eventId?: string | null;
  action?: string;
}

export interface EventRecord {
  timestamps: number[];
}

export type PropositionList = Proposition[];

export interface Proposition {
  id: string;
  scope: string;
  scopeDetails: ScopeDetails;
  items: PropositionItem[];
}

// A type alias, so it is assignable to the `Record<string, unknown>` of DecisionMeta.
export type ScopeDetails = {
  decisionProvider: string;
  correlationID: string;
  characteristics: Characteristics;
  rank: number;
  activity: Activity;
};

export interface Characteristics {
  eventToken: string;
}

export interface Activity {
  id: string;
  priority: number;
  matchedSurfaces: string[];
}

export interface PropositionItem {
  schema: string;
  data: EventHistoryOperationData | Record<string, unknown>;
  id: string;
}

export interface EventHistoryOperationData {
  operation: string;
  content: RulesEventPayload;
  qualifiedDate: number;
}

export interface RulesEventPayload {
  "iam.eventType": string;
  "iam.id": string;
  "iam.action"?: string;
  [key: string]: string | undefined;
}

/** A rule consequence's detail, as returned by `@adobe/aep-rules-engine`. */
export interface ConsequenceDetail {
  schema?: string;
  data?: Record<string, unknown>;
  id?: string;
  html?: string;
  mobileParameters?: Record<string, unknown>;
  [key: string]: unknown;
}

/** A rule consequence, as returned by `@adobe/aep-rules-engine`. */
export interface Consequence {
  id: string;
  type: string;
  detail: ConsequenceDetail;
}

export const Types = {};
