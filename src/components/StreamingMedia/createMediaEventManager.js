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

export default ({
  config,
  eventManager,
  consent,
  sendEdgeNetworkRequest,
  setTimestamp,
}) => {
  return {
    createMediaEvent({ options }) {
      const event = eventManager.createEvent();
      const { xdm } = options;
      setTimestamp(xdm);
      event.setUserXdm(xdm);

      if (xdm.eventType === MediaEvents.AD_START) {
        const { advertisingDetails } = options.xdm.mediaCollection;

        event.mergeXdm({
          mediaCollection: {
            advertisingDetails: {
              playerName:
                advertisingDetails.playerName ||
                config.streamingMedia.playerName,
            },
          },
        });
      }
      return event;
    },
    createMediaSession(options) {
      const { playerName, channel, appVersion } = config.streamingMedia;
      const event = eventManager.createEvent();
      const { sessionDetails } = options.xdm.mediaCollection;
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
          playhead: toInteger(playhead),
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
