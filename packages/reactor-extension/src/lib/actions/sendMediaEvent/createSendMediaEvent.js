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

module.exports = ({
  instanceManager,
  trackMediaSession,
  mediaCollectionSessionStorage,
  satelliteApi,
  logger,
}) => {
  return (settings, event) => {
    const { instanceName, eventType, playerId, xdm } = settings;
    const instance = instanceManager.getInstance(instanceName);

    if (!instance) {
      throw new Error(
        `Failed to send media event for instance "${instanceName}". No matching instance was configured with this name.`,
      );
    }

    if (!event || !event.element) {
      logger.warn(
        `Media element not found when running "Send Media Event". This action is meant to be used with a Media event.`,
      );
      return Promise.resolve();
    }

    if (eventType === "media.sessionStart") {
      return trackMediaSession(settings, event);
    }

    const sessionDetails = mediaCollectionSessionStorage.get({ playerId });
    if (!sessionDetails) {
      // eslint-disable-next-line no-console
      console.warn(
        `No media session found for player ID ${playerId}. Skipping media event ${eventType}. Make sure the session has started.`,
      );
      return Promise.resolve();
    }
    return sessionDetails.sessionPromise.then((sessionID) => {
      if (
        eventType === "media.sessionEnd" ||
        eventType === "media.sessionComplete"
      ) {
        mediaCollectionSessionStorage.remove({ playerId });
      }

      xdm.eventType = eventType;

      const options = { xdm };

      event.mediaPlayer = { id: playerId };

      if (sessionDetails.handleMediaSessionAutomatically) {
        options.playerId = playerId;
      } else {
        xdm.mediaCollection.playhead = satelliteApi.getVar(
          sessionDetails.playhead,
          event,
        );

        if (sessionDetails.qoeDataDetails) {
          xdm.mediaCollection.qoeDataDetails = satelliteApi.getVar(
            sessionDetails.qoeDataDetails,
            event,
          );
        }

        xdm.mediaCollection.sessionID = sessionID;
      }

      return instance("sendMediaEvent", options);
    });
  };
};
