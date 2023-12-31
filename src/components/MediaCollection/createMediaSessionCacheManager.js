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

export default () => {
  let mediaSessionCache;

  const getSession = playerId => {
    return mediaSessionCache[playerId] || {};
  };

  const saveHeartbeat = ({ playerId, heartbeatId }) => {
    const sessionDetails = mediaSessionCache[playerId];

    if (!sessionDetails) {
      return;
    }

    sessionDetails.heartbeatId = heartbeatId;
  };

  const stopHeartbeat = ({ playerId }) => {
    const sessionDetails = mediaSessionCache[playerId];

    if (!sessionDetails) {
      return;
    }

    clearInterval(sessionDetails.heartbeatId);

    sessionDetails.heartbeatId = null;
  };

  const updateLastTriggeredEventTS = ({ playerId }) => {
    const sessionDetails = mediaSessionCache[playerId];

    if (!sessionDetails) {
      return;
    }

    sessionDetails.latestTriggeredEvent = Date.now();
  };

  const storeSession = ({ playerId, sessionDetails }) => {
    if (mediaSessionCache === undefined) {
      mediaSessionCache = {};
    }

    mediaSessionCache[playerId] = sessionDetails;
  };

  return {
    getSession,
    stopHeartbeat,
    updateLastTriggeredEventTS,
    storeSession,
    saveHeartbeat
  };
};
