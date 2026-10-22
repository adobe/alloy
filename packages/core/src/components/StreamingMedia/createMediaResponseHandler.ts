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
import isBlankString from "../../utils/isBlankString.js";
import MediaEvents from "./constants/eventTypes.js";
import { isNonEmptyArray } from "../../utils/index.js";
import PlaybackState from "./constants/playbackState.js";
import type { Response } from "../../core/types.js";
import type { StreamingMediaComponentConfig } from "./configValidators.js";
import type {
  GetPlayerDetails,
  MediaSessionCacheManager,
} from "./createMediaSessionCacheManager.js";
import type { TrackMediaEvent } from "./createTrackMediaEvent.js";

export interface CreateMediaResponseHandlerOptions {
  mediaSessionCacheManager: Pick<MediaSessionCacheManager, "savePing">;
  config: StreamingMediaComponentConfig;
  trackMediaEvent: TrackMediaEvent;
}

export type MediaResponseHandler = (options: {
  response: Response;
  playerId?: string;
  getPlayerDetails?: GetPlayerDetails;
}) => { sessionId?: string };

export default ({
  mediaSessionCacheManager,
  config,
  trackMediaEvent,
}: CreateMediaResponseHandlerOptions): MediaResponseHandler => {
  return ({ response, playerId, getPlayerDetails }) => {
    // Edge sends new-session payloads as objects with a sessionId.
    const mediaPayload = response.getPayloadsByType(
      "media-analytics:new-session",
    ) as { sessionId?: string }[];
    if (isNonEmptyArray(mediaPayload)) {
      const { sessionId } = mediaPayload[0];
      if (isBlankString(sessionId)) {
        return {};
      }

      if (!playerId || !getPlayerDetails) {
        return { sessionId };
      }

      // The session request is only sent when streamingMedia is configured.
      const pingId = setTimeout(() => {
        trackMediaEvent({
          playerId,
          xdm: {
            eventType: MediaEvents.PING,
          },
        });
      }, config.streamingMedia!.mainPingInterval * 1000);

      mediaSessionCacheManager.savePing({
        playerId,
        pingId,
        playbackState: PlaybackState.MAIN,
      });

      return { sessionId };
    }
    return {};
  };
};
