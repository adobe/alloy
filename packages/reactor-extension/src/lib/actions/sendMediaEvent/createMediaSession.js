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

module.exports =
  ({
    instanceManager,
    mediaCollectionSessionStorage,
    satelliteApi,
    getConfigOverrides,
  }) =>
  (settings, event) => {
    const {
      instanceName,
      handleMediaSessionAutomatically,
      playerId,
      xdm,
      ...otherSettings
    } = settings;
    const instance = instanceManager.getInstance(instanceName);

    event.mediaPlayer = {
      id: playerId,
    };

    const options = { xdm };
    options.edgeConfigOverrides = getConfigOverrides(otherSettings);

    const sessionDetails = mediaCollectionSessionStorage.get({ playerId });

    if (sessionDetails) {
      return Promise.resolve();
    }
    const { playhead, qoeDataDetails } = xdm.mediaCollection;
    const playheadVar = satelliteApi.getVar(playhead, event);
    xdm.mediaCollection.playhead = playheadVar;

    if (qoeDataDetails) {
      const qoeDataDetailsVar = satelliteApi.getVar(qoeDataDetails, event);
      xdm.mediaCollection.qoeDataDetails = qoeDataDetailsVar;
    }

    if (handleMediaSessionAutomatically) {
      options.playerId = playerId;

      options.getPlayerDetails = ({ playerId: id }) => {
        event.mediaPlayer = {
          id,
        };
        const playerDetails = {
          playhead: satelliteApi.getVar(playhead, event),
        };

        if (qoeDataDetails) {
          playerDetails.qoeDataDetails = satelliteApi.getVar(
            qoeDataDetails,
            event,
          );
        }

        return playerDetails;
      };
    }

    const sessionPromise = instance("createMediaSession", options)
      .then((result) => {
        const { sessionId } = result;
        return sessionId;
      })
      .catch((error) => {
        console.error("Error creating media session", error);
        throw error;
      });

    mediaCollectionSessionStorage.add({
      playerId,
      sessionDetails: {
        handleMediaSessionAutomatically,
        sessionPromise,
        playhead,
        qoeDataDetails,
      },
    });
    return sessionPromise;
  };
