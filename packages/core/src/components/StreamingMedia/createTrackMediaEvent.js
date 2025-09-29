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
import MediaEvents from "./constants/eventTypes.js";

const getContentState = (eventType, sessionContentState) => {
  if (
    eventType === MediaEvents.AD_START ||
    eventType === MediaEvents.Ad_BREAK_START ||
    eventType === MediaEvents.AD_SKIP ||
    eventType === MediaEvents.AD_COMPLETE
  ) {
    return "ad";
  }
  if (
    eventType === MediaEvents.AD_BREAK_COMPLETE ||
    eventType === MediaEvents.CHAPTER_COMPLETE ||
    eventType === MediaEvents.CHAPTER_START ||
    eventType === MediaEvents.CHAPTER_SKIP ||
    eventType === MediaEvents.SESSION_START
  ) {
    return "main";
  }
  if (
    eventType === MediaEvents.SESSION_END ||
    eventType === MediaEvents.SESSION_COMPLETE
  ) {
    return "completed";
  }
  return sessionContentState;
};

export default ({ mediaEventManager, mediaSessionCacheManager, config }) => {
  const sendMediaEvent = (options) => {
    const event = mediaEventManager.createMediaEvent({ options });
    const { playerId, xdm } = options;
    const { eventType } = xdm;
    const action = eventType.split(".")[1];
    const { getPlayerDetails, sessionPromise, playbackState } =
      mediaSessionCacheManager.getSession(playerId);
    return sessionPromise.then((result) => {
      if (!result.sessionId) {
        return Promise.reject(
          new Error(
            `Failed to trigger media event: ${eventType}. Session ID is not available for playerId: ${playerId}.`,
          ),
        );
      }
      mediaEventManager.augmentMediaEvent({
        event,
        eventType,
        playerId,
        getPlayerDetails,
        sessionID: result.sessionId,
      });

      return mediaEventManager.trackMediaEvent({ event, action }).then(() => {
        if (playerId) {
          if (
            eventType === MediaEvents.SESSION_COMPLETE ||
            eventType === MediaEvents.SESSION_END
          ) {
            mediaSessionCacheManager.stopPing({ playerId });
          } else {
            const sessionPlaybackState = getContentState(
              eventType,
              playbackState,
            );

            if (sessionPlaybackState === "completed") {
              return;
            }
            const interval =
              sessionPlaybackState === "ad"
                ? config.streamingMedia.adPingInterval
                : config.streamingMedia.mainPingInterval;

            const pingId = setTimeout(() => {
              const pingOptions = {
                playerId,
                xdm: {
                  eventType: MediaEvents.PING,
                },
              };
              sendMediaEvent(pingOptions);
            }, interval * 1000);
            mediaSessionCacheManager.savePing({
              playerId,
              pingId,
              playbackState: sessionPlaybackState,
            });
          }
        }
      });
    });
  };

  return (options) => sendMediaEvent(options);
};
