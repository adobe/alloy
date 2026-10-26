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

/** The push service subscription details sent to the server. */
export interface PushSubscription {
  /** The push service endpoint URL */
  endpoint: string;
  keys: {
    /** The base64 P-256 ECDH public key, or null if not available */
    p256dh: string | null;
    /** The base64 authentication secret, or null if not available */
    auth: string | null;
  };
}

export interface CustomerJourneyManagement {
  messageExecution: {
    messageExecutionID: string;
    messageID: string;
    messageType: string;
    campaignID: string;
    campaignVersionID: string;
    batchInstanceID: string;
  };
  pushChannelContext?: { platform?: "web" };
  messageProfile?: { channel?: { _id?: string } };
}

export interface Decisioning {
  propositions: { scopeDetails: { correlationID: string } }[];
}

export interface XdmTrackingContext {
  _experience: {
    customerJourneyManagement: CustomerJourneyManagement;
    decisioning: Decisioning;
  };
}

export interface PushNotificationButton {
  label: string;
  type: string;
  uri: string;
}

export interface PushNotificationData {
  web: {
    title: string;
    body: string;
    media: string | null;
    identity?: { id?: string; namespace?: string };
    interaction: { type: string; uri: string | null };
    actions: { buttons: PushNotificationButton[] };
    priority: string;
    _xdm: { mixins: XdmTrackingContext };
  };
}

export interface TrackingDataPayload {
  events: {
    xdm: {
      identityMap: { ECID: { id: string }[] };
      timestamp: string;
      pushNotificationTracking: {
        pushProviderMessageID: string;
        pushProvider: string;
        customAction?: { actionID?: string };
      };
      application: { launches: { value: number } };
      eventType: string;
      _experience: {
        customerJourneyManagement: CustomerJourneyManagement;
        decisioning: Decisioning;
      };
    };
    meta: { collect: { datasetId: string } };
  }[];
}

export interface ServiceWorkerLogger {
  namespace: string;
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

export interface PushServiceWorkerConfig {
  ecid?: string;
  browser?: string;
  edgeDomain?: string;
  edgeBasePath?: string;
  datastreamId?: string;
  datasetId?: string;
  id?: string;
  timestamp?: number;
}

export type ReadFromIndexedDb = (
  logger: ServiceWorkerLogger,
) => Promise<PushServiceWorkerConfig | undefined>;

/*
 * The parts of the service worker globals used here. TypeScript's "webworker"
 * lib conflicts with the DOM lib this package is compiled with.
 */
export interface ServiceWorkerClient {
  url: string;
  focus: () => Promise<unknown>;
}

export interface ServiceWorkerScope {
  registration: {
    showNotification: (
      title: string,
      options?: Record<string, unknown>,
    ) => Promise<void>;
  };
  clients: {
    matchAll: (options: { type: "window" }) => Promise<readonly ServiceWorkerClient[]>;
    openWindow?: (url: string) => Promise<unknown>;
  };
}

export interface ServiceWorkerPushEvent {
  data?: { json: () => unknown } | null;
}

export interface ServiceWorkerNotificationClickEvent {
  notification: { close: () => void; data: PushNotificationData["web"] };
  action?: string;
  waitUntil: (promise: Promise<unknown>) => void;
}

export const Types = {};
