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

export interface Identity {
  id: string;
  [key: string]: unknown;
}

export interface RequestContent {
  xdm?: {
    identityMap?: Record<string, Identity[]>;
    [key: string]: unknown;
  };
  meta?: {
    configOverrides?: Record<string, unknown>;
    [key: string]: unknown;
  };
  events?: RequestEvent[];
  [key: string]: unknown;
}

/**
 * Minimal shape of an event added to a data collection request payload.
 */
export interface RequestEvent {
  getDocumentMayUnload(): boolean;
}

/**
 * Request object with methods to access and modify request properties.
 */
export interface Request<P extends RequestPayload = RequestPayload> {
  getId: () => string;
  getPayload: () => P;
  getAction: () => string;
  getDatastreamIdOverride: () => string | undefined;
  getUseSendBeacon: () => boolean;
  getUseKeepalive: () => boolean;
  getEdgeSubPath: () => string;
  getUseIdThirdPartyDomain: () => boolean;
  setUseIdThirdPartyDomain: (value?: boolean) => void;
  setIsIdentityEstablished: () => void;
  getRequestParams: () => Record<string, unknown>;
}

/**
 * Request payload object with methods for merging different types of data.
 */
export interface RequestPayload {
  mergeMeta: (updates: object) => void;
  mergeState: (updates: object) => void;
  mergeQuery: (updates: object) => void;
  mergeConfigOverride: (updates: object) => void;
  finalizeConfigOverrides: () => void;
  addIdentity: (namespaceCode: string, identity: Identity) => void;
  hasIdentity: (namespaceCode: string) => boolean;
  toJSON: () => object;
}

/**
 * Request payload object with methods for merging different types of data.
 */
export interface DataCollectionRequestPayload extends RequestPayload {
  addEvent: (event: RequestEvent) => void;
  getEvents: () => RequestEvent[];
  getDocumentMayUnload: () => boolean;
}

export const Types = {};
