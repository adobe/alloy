/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import MediaEvents from "./constants/eventTypes.js";
import createMediaRequest from "./createMediaRequest.js";
import { toInteger } from "../../utils/index.js";
import { createDataCollectionRequestPayload } from "../../utils/request/index.js";
import type {
  ComponentTools,
  Event,
  EventManager,
  Logger,
} from "../../core/types.js";
import type { StreamingMediaComponentConfig } from "./configValidators.js";
import type {
  GetPlayerDetails,
  MediaSessionResult,
} from "./createMediaSessionCacheManager.js";

export type MediaEventType = (typeof MediaEvents)[keyof typeof MediaEvents];

/** The `xdm.mediaCollection` members this component reads. */
export interface MediaCollection {
  advertisingDetails?: { playerName?: string; [key: string]: unknown };
  sessionDetails?: {
    playerName?: string;
    channel?: string;
    appVersion?: string;
    [key: string]: unknown;
  };
  playhead?: number;
  sessionID?: string;
  [key: string]: unknown;
}

/** The validated `sendMediaEvent` options. */
export interface MediaEventOptions {
  playerId?: string;
  xdm: {
    eventType: MediaEventType;
    mediaCollection?: MediaCollection;
    [key: string]: unknown;
  };
}

/** The validated `createMediaSession` options. */
export interface MediaSessionOptions {
  playerId?: string;
  getPlayerDetails?: GetPlayerDetails;
  xdm: {
    // The validator requires sessionDetails in every accepted shape.
    mediaCollection: MediaCollection &
      Required<Pick<MediaCollection, "sessionDetails">>;
    [key: string]: unknown;
  };
  edgeConfigOverrides?: Record<string, unknown>;
}

/** Sent as `mediaOptions` to the `onBeforeEvent` hook. */
export type MediaOptions = {
  playerId?: string;
  getPlayerDetails?: GetPlayerDetails;
  legacy?: boolean;
};

export interface MediaEventManager {
  createMediaEvent: (arg: { options: MediaEventOptions }) => Event;
  createMediaSession: (options: MediaSessionOptions) => Event;
  augmentMediaEvent: (options: {
    event: Event;
    eventType?: MediaEventType;
    playerId?: string;
    getPlayerDetails?: GetPlayerDetails;
    sessionID?: string;
  }) => Event;
  trackMediaSession: (options: {
    event: Event;
    mediaOptions: MediaOptions;
    edgeConfigOverrides?: Record<string, unknown>;
  }) => Promise<MediaSessionResult | undefined>;
  trackMediaEvent: (options: {
    event: Event;
    action: string;
  }) => Promise<Record<string, never>>;
}

export interface CreateMediaEventManagerOptions {
  config: StreamingMediaComponentConfig;
  eventManager: EventManager;
  /** Passed by `index` but not used. */
  logger?: Logger;
  consent: Pick<ComponentTools["consent"], "awaitConsent">;
  sendEdgeNetworkRequest: ComponentTools["sendEdgeNetworkRequest"];
  setTimestamp: (event: Event) => void;
}

export default ({
  config,
  eventManager,
  consent,
  sendEdgeNetworkRequest,
  setTimestamp,
}: CreateMediaEventManagerOptions): MediaEventManager => {
  return {
    createMediaEvent({ options }) {
      const event = eventManager.createEvent();
      const { xdm } = options;
      setTimestamp(event);
      event.setUserXdm(xdm);

      if (xdm.eventType === MediaEvents.AD_START) {
        // Ad start events have always been assumed to carry advertisingDetails.
        const { advertisingDetails } = options.xdm.mediaCollection!;

        event.mergeXdm({
          mediaCollection: {
            advertisingDetails: {
              playerName:
                // See above; streamingMedia is checked before any media event.
                advertisingDetails!.playerName ||
                config.streamingMedia!.playerName,
            },
          },
        });
      }
      return event;
    },
    createMediaSession(options) {
      // trackMediaSession checks streamingMedia before creating a session.
      const { playerName, channel, appVersion } = config.streamingMedia!;
      const event = eventManager.createEvent();
      const { sessionDetails } = options.xdm.mediaCollection;
      setTimestamp(event);
      event.setUserXdm(options.xdm);
      event.mergeXdm({
        eventType: MediaEvents.SESSION_START,
        mediaCollection: {
          sessionDetails: {
            playerName: sessionDetails.playerName || playerName,
            channel: sessionDetails.channel || channel,
            appVersion: sessionDetails.appVersion || appVersion,
          },
        },
      });

      return event;
    },
    augmentMediaEvent({ event, playerId, getPlayerDetails, sessionID }) {
      if (!playerId || !getPlayerDetails) {
        return event;
      }
      const { playhead, qoeDataDetails } = getPlayerDetails({ playerId });

      event.mergeXdm({
        mediaCollection: {
          // Called without a default since before TypeScript: an
          // unparseable playhead becomes undefined.
          playhead: (toInteger as (value: unknown) => number | undefined)(
            playhead,
          ),
          qoeDataDetails,
          sessionID,
        },
      });
      return event;
    },
    trackMediaSession({ event, mediaOptions, edgeConfigOverrides }) {
      const sendEventOptions = { mediaOptions, edgeConfigOverrides };

      return eventManager.sendEvent(event, sendEventOptions);
    },
    trackMediaEvent({ event, action }) {
      const mediaRequestPayload = createDataCollectionRequestPayload();
      const request = createMediaRequest({
        mediaRequestPayload,
        action,
      });
      mediaRequestPayload.addEvent(event);
      event.finalize();

      return consent.awaitConsent().then(() => {
        return sendEdgeNetworkRequest({ request }).then(() => {
          return {};
        });
      });
    },
  };
};
