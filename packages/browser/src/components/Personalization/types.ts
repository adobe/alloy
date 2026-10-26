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

import type {
  DecisionMeta,
  PropositionAction,
} from "@adobe/alloy-core/utils/event.js";
import type createCollect from "@adobe/alloy-core/utils/createCollect.js";
import type { Logger, Response } from "@adobe/alloy-core/core/types.js";

export type { DecisionMeta, PropositionAction, Logger };

/** Per-decision-provider setting for automatic interaction collection. */
export type AutoCollectPropositionInteractions = Record<string, string>;

export interface PersonalizationConfig {
  prehidingStyle?: string;
  targetMigrationEnabled?: boolean;
  autoCollectPropositionInteractions: AutoCollectPropositionInteractions;
}

// Proposition payloads come from Edge or from the applyPropositions command, so
// every field is optional and unknown extras are preserved.
export interface ScopeDetails {
  decisionProvider?: string;
  characteristics?: { scopeType?: string; [key: string]: unknown };
  [key: string]: unknown;
}

/** Item data; `type`, `selector` and friends are read at the boundary, `content` depends on `type`. */
export interface ItemData {
  type?: string;
  selector?: string;
  prehidingSelector?: string;
  content?: unknown;
  [key: string]: unknown;
}

export interface ItemPayload {
  id?: string;
  schema: string;
  data?: ItemData;
  characteristics?: { trackingLabel?: string; [key: string]: unknown };
  [key: string]: unknown;
}

export interface PropositionPayload {
  id?: string;
  scope?: string;
  scopeDetails?: ScopeDetails;
  items?: ItemPayload[];
  renderAttempted?: boolean;
  [key: string]: unknown;
}

/** The identifying part of a proposition, sent back in notifications. */
export interface Notification extends DecisionMeta {
  scopeDetails?: ScopeDetails;
}

/** A notification enriched with the click tracking details of an item. */
export interface ClickMeta extends Notification {
  trackingLabel?: string;
  scopeType?: string;
}

export interface IdentityMap {
  [namespace: string]: {
    id: string;
    authenticatedState?: string;
    primary?: boolean;
  }[];
}

export interface PropositionItem {
  getId(): string | undefined;
  getSchema(): string;
  getSchemaType(): string | undefined;
  getData(): ItemData | undefined;
  getProposition(): Proposition;
  getTrackingLabel(): string | undefined;
  getOriginalItem(): ItemPayload;
  toString(): string;
  toJSON(): ItemPayload;
}

export interface Proposition {
  getScope(): string | undefined;
  getScopeType(): string;
  getItems(): PropositionItem[];
  getNotification(): Notification;
  getId(): string | undefined;
  getIdentityMap(): IdentityMap | undefined;
  toJSON(): PropositionPayload;
  shouldSuppressDisplay(): boolean;
  addToReturnValues(
    propositions: PropositionPayload[],
    decisions: PropositionPayload[],
    includedItems: PropositionItem[],
    renderAttempted: boolean,
  ): void;
}

export type CreateProposition = (
  payload: PropositionPayload,
  visibleInReturnedItems?: boolean,
  shouldSuppressDisplay?: boolean,
  identityMap?: IdentityMap,
) => Proposition;

/** What a schema processor decides about one item. */
export interface ItemProcessResult {
  render?: () => unknown;
  setRenderAttempted?: boolean;
  includeInNotification?: boolean;
  onlyRenderThis?: boolean;
}

export type SchemaProcessor = (item: PropositionItem) => ItemProcessResult;

export interface ProcessPropositionsResult {
  returnedPropositions: PropositionPayload[];
  returnedDecisions: PropositionPayload[];
  render: () => Promise<DecisionMeta[]>;
}

export type ProcessPropositions = (
  renderPropositions: Proposition[],
  nonRenderPropositions?: Proposition[],
) => ProcessPropositionsResult;

/** Marks an element as belonging to a proposition so interactions can be tracked. */
export type DecorateProposition = (element: Node) => void;

export interface RenderStatusHandler {
  shouldRender: (propositionContainer: Element | null) => boolean;
  markAsRendered: (propositionContainer: Element) => void;
}

export type DomActionModule = (
  itemData: ItemData,
  decorateProposition: DecorateProposition,
  renderStatusHandler: RenderStatusHandler,
) => Promise<void>;

export type DomActionModules = Record<string, DomActionModule>;

export type GetPageLocation = () => { host: string; pathname: string };

export type StoreInteractionMeta = (
  propositionId: string | undefined,
  itemId: string | undefined,
  scopeType: string,
  notification: Notification,
  interactId: number | string,
) => void;

export interface InteractionResult {
  decisionsMeta?: ClickMeta[];
  propositionActionLabel?: string | null;
  propositionActionToken?: string | null;
  viewName?: string;
}

/** Display settings of one in-app message element. */
export interface WebParameter {
  style?: Record<string, string | number>;
  params?: {
    parentElement?: string;
    insertionMethod?: string;
    enabled?: boolean;
  };
}

export type WebParameters = Record<string, WebParameter>;

export interface MobileParameters {
  verticalAlign?: string;
  width?: number;
  horizontalAlign?: string;
  backdropColor?: string;
  backdropOpacity?: number;
  height?: number;
  cornerRadius?: number;
  horizontalInset?: number;
  verticalInset?: number;
  uiTakeover?: boolean;
}

/** The data of an in-app message item, once validated. */
export interface InAppMessageData {
  type?: string;
  content?: unknown;
  contentType?: string;
  mobileParameters?: MobileParameters;
  webParameters?: WebParameters;
  meta?: Notification;
  identityMap?: IdentityMap;
}

/** What the in-app message actions receive: the validated data plus its notification. */
export interface InAppMessageSettings extends InAppMessageData {
  meta: Notification;
}

export type InAppMessageModules = Record<
  string,
  (settings: InAppMessageSettings) => unknown
>;

export type Collect = ReturnType<typeof createCollect>;

export type StoreClickMeta = (click: {
  selector: string;
  meta: ClickMeta;
}) => void;

export type GetInteractionMetas = (interactIds: string[]) => ClickMeta[];
export type GetClickMetas = (selector: string) => ClickMeta[];

export type NotificationHandler = (
  isRenderDecisions: boolean | undefined,
  isSendDisplayEvent: boolean,
  viewName: string | undefined,
  identityMap?: IdentityMap,
) => (
  decisionsMetaDisplay: DecisionMeta[],
  decisionsMetaSuppressed?: DecisionMeta[],
) => void;

export type OnResponse = (
  callback: (payload: { response: Response }) => unknown,
) => void;

/** The `personalization` option of `sendEvent`. */
export interface EventPersonalizationOptions {
  sendDisplayEvent?: boolean;
  includeRenderedPropositions?: boolean;
  decisionScopes?: string[];
  surfaces?: unknown[];
  defaultPersonalizationEnabled?: boolean;
}

export interface QueryDetails {
  schemas: string[];
  decisionScopes: string[];
  surfaces: string[];
}

export interface PersonalizationDetails {
  isRenderDecisions(): boolean | undefined;
  isSendDisplayEvent(): boolean;
  shouldIncludeRenderedPropositions(): boolean;
  getViewName(): string | undefined;
  hasScopes(): boolean;
  hasSurfaces(): boolean;
  hasViewName(): boolean;
  createQueryDetails(): QueryDetails;
  isCacheInitialized(): boolean;
  shouldFetchData(): boolean | undefined;
  shouldUseCachedData(): boolean;
  shouldRequestDefaultPersonalization(): boolean | undefined;
}

export interface AsyncArray<T> {
  concat(promise: Promise<T | T[]>): void;
  clear(): Promise<T[]>;
}

export interface CacheUpdate {
  update(viewPropositions: Proposition[]): Proposition[];
  cancel(): void;
}

export interface ViewCache {
  createCacheUpdate(viewName?: string): CacheUpdate;
  getView(viewName: string): Promise<Proposition[]>;
  isInitialized(): boolean;
}

/** Registers a callback to run with the Edge response. */
export type OnRequestFailure = (callback: () => unknown) => void;
