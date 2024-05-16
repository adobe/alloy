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

import PlaybackState from "./constants/playbackState";

export default () => {
  let mediaSessionCache;

  const getSession = playerId => {
    return mediaSessionCache[playerId] || {};
  };

  const savePing = ({ playerId, pingId, playbackState }) => {
    if (!mediaSessionCache[playerId]) {
      return;
    }
    if (mediaSessionCache[playerId].pingId) {
      clearTimeout(mediaSessionCache[playerId].pingId);
    }

    mediaSessionCache[playerId].pingId = pingId;
    mediaSessionCache[playerId].playbackState = playbackState;
  };

  const stopPing = ({ playerId }) => {
    const sessionDetails = mediaSessionCache[playerId];

    if (!sessionDetails) {
      return;
    }

    clearTimeout(sessionDetails.pingId);

    sessionDetails.pingId = null;
    sessionDetails.playbackState = PlaybackState.COMPLETED;
  };
  const storeSession = ({ playerId, sessionDetails }) => {
    if (mediaSessionCache === undefined) {
      mediaSessionCache = {};
    }

    mediaSessionCache[playerId] = sessionDetails;
  };

  return {
    getSession,
    storeSession,
    stopPing,
    savePing
  };
};
