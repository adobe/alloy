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
import PlaybackState from "./constants/playbackState.js";

export default ({
  config,
  mediaEventManager,
  mediaSessionCacheManager,
  legacy = false,
}) => {
  return (options) => {
    if (!config.streamingMedia) {
      return Promise.reject(new Error("Streaming media is not configured."));
    }

    const { playerId, getPlayerDetails } = options;
    const event = mediaEventManager.createMediaSession(options);

    mediaEventManager.augmentMediaEvent({
      event,
      playerId,
      getPlayerDetails,
    });

    const sessionPromise = mediaEventManager.trackMediaSession({
      event,
      mediaOptions: {
        playerId,
        getPlayerDetails,
        legacy,
      },
    });

    mediaSessionCacheManager.storeSession({
      playerId,
      sessionDetails: {
        sessionPromise,
        getPlayerDetails,
        playbackState: PlaybackState.MAIN,
      },
    });

    return sessionPromise;
  };
};
