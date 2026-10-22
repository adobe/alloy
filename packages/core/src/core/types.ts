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

import type { NetworkResponse } from "../services/types.js";
import type {
  Event as BaseEvent,
  Logger as BaseLogger,
} from "../utils/types.js";
import type { ObjectValidator } from "../utils/validation/types.js";

/** Console methods the logger writes to. */
export type LogLevel = "info" | "warn" | "error";

/** Added by the logger to every monitor payload. */
export interface LoggerContext {
  instanceName: string;
  componentName?: string;
}

export interface InstanceCreatedLogData {
  /** The `alloy` command function of the new instance. */
  instance: (
    commandName: string,
    options?: Record<string, unknown>,
  ) => Promise<Record<string, unknown> | void>;
}

export interface InstanceConfiguredLogData {
  config: Record<string, unknown>;
  /** Extra params from each component's `buildOnInstanceConfiguredExtraParams`. */
  [extraParam: string]: unknown;
}

export interface CommandLogData {
  commandName: string;
  options: unknown;
}

export interface CommandResolvedLogData extends CommandLogData {
  result: Record<string, unknown>;
}

export interface CommandRejectedLogData extends CommandLogData {
  error: unknown;
}

export interface NetworkRequestLogData {
  requestId: string;
  url: string;
  /** The request payload, parsed back from JSON. */
  payload: unknown;
}

export interface NetworkResponseLogData
  extends NetworkRequestLogData, NetworkResponse {
  parsedBody: unknown;
  retriesAttempted: number;
}

export interface NetworkErrorLogData extends NetworkRequestLogData {
  error: unknown;
}

export interface ContentHidingLogData {
  status: string;
  message: string;
  logLevel: LogLevel;
}

export interface ContentRenderingLogData extends ContentHidingLogData {
  detail: unknown;
  error?: unknown;
}

/** The redacted `config`/`options`, when the logged data had them. */
interface RedactedLogFields {
  config?: unknown;
  options?: unknown;
}

/** Payload passed to every monitor hook: the logged data plus the logger context. */
export type MonitorPayload<T> = LoggerContext & RedactedLogFields & T;

export interface AlloyMonitor {
  onBeforeLog?: (
    data: MonitorPayload<{ level: LogLevel; arguments: unknown[] }>,
  ) => void;
  onInstanceCreated?: (data: MonitorPayload<InstanceCreatedLogData>) => void;
  onInstanceConfigured?: (
    data: MonitorPayload<InstanceConfiguredLogData>,
  ) => void;
  onBeforeCommand?: (data: MonitorPayload<CommandLogData>) => void;
  onCommandResolved?: (data: MonitorPayload<CommandResolvedLogData>) => void;
  onCommandRejected?: (data: MonitorPayload<CommandRejectedLogData>) => void;
  onBeforeNetworkRequest?: (
    data: MonitorPayload<NetworkRequestLogData>,
  ) => void;
  onNetworkResponse?: (data: MonitorPayload<NetworkResponseLogData>) => void;
  onNetworkError?: (data: MonitorPayload<NetworkErrorLogData>) => void;
  onContentHiding?: (data: MonitorPayload<{ status: string }>) => void;
  onContentRendering?: (
    data: MonitorPayload<{ status: string; payload: unknown }>,
  ) => void;
}

export interface Logger extends BaseLogger {
  enabled: boolean;
  logOnInstanceCreated: (data: InstanceCreatedLogData) => void;
  logOnInstanceConfigured: (data: InstanceConfiguredLogData) => void;
  logOnBeforeCommand: (data: CommandLogData) => void;
  logOnCommandResolved: (data: CommandResolvedLogData) => void;
  logOnCommandRejected: (data: CommandRejectedLogData) => void;
  logOnBeforeNetworkRequest: (data: NetworkRequestLogData) => void;
  logOnNetworkResponse: (data: NetworkResponseLogData) => void;
  logOnNetworkError: (data: NetworkErrorLogData) => void;
  logOnContentHiding: (data: ContentHidingLogData) => void;
  logOnContentRendering: (data: ContentRenderingLogData) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

/** The content handed to `onBeforeEventSend`; the callback may replace both. */
export interface EventSendContent {
  xdm: Record<string, unknown>;
  data: Record<string, unknown>;
}

/** Returning `false` cancels the event. */
export type OnBeforeEventSend = (content: EventSendContent) => unknown;

// mergeXdm, mergeQuery and documentMayUnload are inherited from the utils Event.
export interface Event extends BaseEvent {
  hasQuery: () => boolean;
  getContent: () => Record<string, unknown>;
  setUserXdm: (xdm: Record<string, unknown>) => void;
  setUserData: (data: Record<string, unknown>) => void;
  mergeData: (data: Record<string, unknown>) => void;
  mergeMeta: (meta: Record<string, unknown>) => void;
  finalize: (onBeforeEventSend?: OnBeforeEventSend) => void;
  getDocumentMayUnload: () => boolean;
  isEmpty: () => boolean;
  shouldSend: () => boolean;
  getViewName: () => string | undefined;
  toJSON: () => Record<string, unknown>;
}

export interface SendEventOptions {
  /** configuration */
  edgeConfigOverrides?: Record<string, unknown>;
  renderDecisions?: boolean;
  decisionScopes?: string[];
  decisionContext?: Record<string, unknown>;
  personalization?: Record<string, unknown>;
  mediaOptions?: Record<string, unknown>;
}

export interface ApplyResponseOptions {
  /** @default false */
  renderDecisions?: boolean;
  /** @default {} */
  decisionContext?: Record<string, unknown>;
  /** @default {} */
  responseHeaders?: Record<string, string>;
  /** @default {handle:[]} */
  responseBody?: ResponseContent;
  personalization?: Record<string, unknown>;
}

export interface EventManager {
  createEvent: () => Event;
  /** Resolves to `undefined` when `onBeforeEventSend` cancels the event. */
  sendEvent: (
    event: Event,
    options?: SendEventOptions,
  ) => Promise<Record<string, unknown> | undefined>;
  applyResponse: (
    event: Event,
    options?: ApplyResponseOptions,
  ) => Promise<Record<string, unknown>>;
}

export interface ResponseContent {
  /** Array of response fragments with type and payload */
  handle?: { type: string; payload: unknown[] }[];
  /** Array of error objects */
  errors?: Record<string, unknown>[];
  /** Array of warning objects */
  warnings?: Record<string, unknown>[];
}

export interface ResponseFragment {
  /** Fragment type in format "<namespace:action>" */
  type: string;
  /** Fragment payload data */
  payload: unknown;
}

export interface Response {
  /** Returns matching fragments by type (e.g., "identity:persist") */
  getPayloadsByType: (type: string) => unknown[];
  /** Returns all error objects from the response */
  getErrors: () => Record<string, unknown>[];
  /** Returns all warning objects from the response */
  getWarnings: () => Record<string, unknown>[];
  /** Returns object containing regionId from x-adobe-edge header */
  getEdge: () => { regionId?: number };
  toJSON: () => ResponseContent;
}

export type ResponseCreator = (options: {
  content?: ResponseContent;
  getHeader: (name: string) => string | null | undefined;
}) => Response;

/** The hooks a component may implement; see `createLifecycle`. */
export type LifecycleHookName =
  | "onComponentsRegistered"
  | "onBeforeEvent"
  | "onBeforeRequest"
  | "onResponse"
  | "onRequestFailure"
  | "onClick"
  | "onDecision";

/**
 * Each hook takes one payload object whose shape depends on the hook. The
 * `never` parameter accepts a hook with any payload type.
 */
export type ComponentLifecycle = Partial<
  Record<LifecycleHookName, (payload: never) => unknown>
>;

export interface ComponentCommand {
  /** Set by the component registry when the command is registered. */
  commandName?: string;
  documentationUri?: string;
  /** Takes the user's options and returns the validated options. */
  optionsValidator?: (options: never) => unknown;
  /** Takes the validated options. */
  run: (options: never) => unknown;
}

/** What a component creator returns. */
export interface Component {
  lifecycle?: ComponentLifecycle;
  commands?: Record<string, ComponentCommand>;
}

/** A component factory, with its static `namespace` and config validators. */
export interface ComponentCreator {
  /** `tools` are the per-component helpers core injects. */
  (tools: never): Component;
  namespace: string;
  configValidators?: ObjectValidator;
  buildOnInstanceConfiguredExtraParams?: (options: {
    config: Record<string, unknown>;
    logger: Logger;
  }) => Record<string, unknown>;
}

export const Types = {};
