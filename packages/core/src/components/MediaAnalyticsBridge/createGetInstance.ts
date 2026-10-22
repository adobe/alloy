/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { EVENT, MEDIA_EVENTS_INTERNAL } from "./constants/constants.js";
import {
  isEmptyObject,
  isNil,
  isNonEmptyArray,
  isNumber,
} from "../../utils/index.js";
import {
  adsToXdmKeys,
  mediaToXdmKeys,
} from "./constants/mediaKeysToXdmConverter.js";
import type { Logger } from "../../core/types.js";

export interface MediaCollection {
  sessionDetails?: Record<string, unknown>;
  advertisingDetails?: Record<string, unknown>;
  customMetadata?: { name: string; value: unknown }[];
  statesStart?: Record<string, unknown>[];
  statesEnd?: Record<string, unknown>[];
  [key: string]: unknown;
}

export interface MediaXdm {
  eventType: string;
  mediaCollection: MediaCollection;
}

export interface PlayerDetails {
  playhead: number;
  qoeDataDetails: Record<string, unknown> | null;
}

export interface GetInstanceOptions {
  logger: Logger;
  trackMediaSession: (options: {
    playerId: string;
    getPlayerDetails: () => PlayerDetails;
    xdm: MediaXdm;
  }) => unknown;
  trackMediaEvent: (options: { playerId: string; xdm: MediaXdm }) => unknown;
  uuid: () => string;
}

interface TrackerState {
  qoe: Record<string, unknown> | null;
  lastPlayhead: number;
  playerId: string;
}

export default ({
  logger,
  trackMediaSession,
  trackMediaEvent,
  uuid,
}: GetInstanceOptions) => {
  let trackerState: TrackerState | null = null;
  const instantiateTracker = () => {
    trackerState = {
      qoe: null,
      lastPlayhead: 0,
      playerId: uuid(),
    };
  };
  const getEventType = ({ eventType }: { eventType: string }) => {
    if (
      eventType === EVENT.BufferComplete ||
      eventType === EVENT.SeekComplete
    ) {
      return MEDIA_EVENTS_INTERNAL.Play;
    }
    if (eventType === EVENT.StateStart || eventType === EVENT.StateEnd) {
      return MEDIA_EVENTS_INTERNAL.StateUpdate;
    }
    if (eventType === EVENT.SeekStart) {
      return MEDIA_EVENTS_INTERNAL.Pause;
    }
    return eventType;
  };
  const createXdmObject = ({
    eventType,
    mediaDetails = {},
    // An empty array has no keys, like an empty context object.
    contextData = [] as unknown as Record<string, unknown>,
  }: {
    eventType: string;
    mediaDetails?: MediaCollection;
    contextData?: Record<string, unknown>;
  }): MediaXdm => {
    const action = getEventType({ eventType });

    if (eventType === EVENT.StateStart) {
      const xdm = {
        eventType: `media.${action}`,
        mediaCollection: {
          statesStart: [mediaDetails],
        },
      };
      return xdm;
    }
    if (eventType === EVENT.StateEnd) {
      const xdm = {
        eventType: `media.${action}`,
        mediaCollection: {
          statesEnd: [mediaDetails],
        },
      };
      return xdm;
    }
    const xdm: MediaXdm = {
      eventType: `media.${action}`,
      mediaCollection: {
        ...mediaDetails,
      },
    };

    const customMetadata: { name: string; value: unknown }[] = [];
    Object.keys(contextData).forEach((key) => {
      if (mediaToXdmKeys[key]) {
        // A media object with context data carries sessionDetails; this threw before typing too.
        xdm.mediaCollection.sessionDetails![mediaToXdmKeys[key]] =
          contextData[key];
      } else if (adsToXdmKeys[key]) {
        // An ad object with context data carries advertisingDetails; this threw before typing too.
        xdm.mediaCollection.advertisingDetails![adsToXdmKeys[key]] =
          contextData[key];
      } else {
        customMetadata.push({
          name: key,
          value: contextData[key],
        });
      }
    });
    if (isNonEmptyArray(customMetadata)) {
      xdm.mediaCollection.customMetadata = customMetadata;
    }

    return xdm;
  };

  return {
    trackSessionStart: (
      mediaObject: MediaCollection | null | undefined,
      contextData: Record<string, unknown> = {},
    ) => {
      if (isNil(mediaObject) || isEmptyObject(mediaObject)) {
        logger.warn("Invalid media object");
        return {};
      }
      if (trackerState === null) {
        logger.warn(
          "The Media Session was completed. Restarting a new session.",
        );
        instantiateTracker();
      }
      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.SessionStart,
        mediaDetails: mediaObject,
        contextData,
      });

      return trackMediaSession({
        // instantiateTracker above set the state if it was null.
        playerId: trackerState!.playerId,
        getPlayerDetails: () => {
          return {
            // Read lazily as before typing; after destroy() this throws, unchanged.
            playhead: trackerState!.lastPlayhead,
            // Read lazily as before typing; after destroy() this throws, unchanged.
            qoeDataDetails: trackerState!.qoe,
          };
        },
        xdm,
      });
    },
    trackPlay: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS_INTERNAL.Play });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackPause: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({ eventType: MEDIA_EVENTS_INTERNAL.Pause });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackSessionEnd: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.SessionEnd,
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackComplete: () => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.SessionComplete,
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackError: (errorId: string) => {
      logger.warn(`trackError(${errorId})`);
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }

      const errorDetails = {
        name: errorId,
        source: "player",
      };

      const xdm = createXdmObject({
        eventType: MEDIA_EVENTS_INTERNAL.Error,
        mediaDetails: { errorDetails },
      });
      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    trackEvent: (
      eventType: string,
      info: MediaCollection,
      contextData?: Record<string, unknown>,
    ) => {
      if (isEmptyObject(info)) {
        logger.warn("Invalid media object.");
        return {};
      }
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return {};
      }
      // Widened so any caller string can be looked up among the literal event names.
      if (!(Object.values(EVENT) as string[]).includes(eventType)) {
        logger.warn("Invalid event type");
        return {};
      }
      const xdm = createXdmObject({
        eventType,
        mediaDetails: info,
        contextData,
      });

      return trackMediaEvent({ playerId: trackerState.playerId, xdm });
    },
    updatePlayhead: (time: unknown) => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return;
      }

      if (isNumber(time)) {
        // parseInt truncates the number through its string form, as before typing.
        trackerState.lastPlayhead = parseInt(time as unknown as string, 10);
      }
    },
    updateQoEObject: (
      qoeObject: Record<string, unknown> | null | undefined,
    ) => {
      if (trackerState === null) {
        logger.warn("The Media Session was completed.");
        return;
      }

      if (!qoeObject) {
        return;
      }
      trackerState.qoe = qoeObject;
    },
    destroy: () => {
      logger.warn("Destroy called, destroying the tracker.");
      trackerState = null;
    },
  };
};
