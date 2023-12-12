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

import { defer } from "../../utils";

export default () => {
  let mediaSessionCache;
  const sessionStorageDeferred = defer();

  const getSession = playerId => {
    return sessionStorageDeferred.promise.then(() => {
      return mediaSessionCache[playerId] || {};
    });
  };

  const saveHeartbeat = ({ playerId, heartbeatId }) => {
    const mediaSession = mediaSessionCache[playerId];
    if (!mediaSession) {
      return;
    }
    mediaSession.heartbeatId = heartbeatId;
  };

  const stopHeartbeat = ({ playerId }) => {
    const mediaSession = mediaSessionCache[playerId];
    if (!mediaSession) {
      return;
    }
    clearInterval(mediaSession.heartbeatId);
    mediaSession.heartbeatId = null;
  };

  const updateLastTriggeredEventTS = ({ playerId }) => {
    const player = mediaSessionCache[playerId];
    if (!player) {
      return;
    }
    player.latestTriggeredEvent = Date.now();
  };

  const storeSession = ({ playerId, sessionDetails }) => {
    if (mediaSessionCache === undefined) {
      mediaSessionCache = {};
    }
    mediaSessionCache[playerId] = sessionDetails;
    sessionStorageDeferred.resolve();
  };

  return {
    getSession,
    stopHeartbeat,
    updateLastTriggeredEventTS,
    storeSession,
    saveHeartbeat
  };
};
