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
/* eslint-disable import/no-restricted-paths */

import MediaEvents from "./constants/eventTypes";
import createMediaRequest from "./createMediaRequest";
import injectTimestamp from "../Context/injectTimestamp";
import { toInteger } from "../../utils";
import { createDataCollectionRequestPayload } from "../../utils/request";

export default ({ config, eventManager, consent, sendEdgeNetworkRequest }) => {
  return {
    createMediaEvent({ options }) {
      const event = eventManager.createEvent();
      const { xdm } = options;
      const timestamp = injectTimestamp(() => new Date());
      timestamp(xdm);
      event.setUserXdm(xdm);
      return event;
    },
    createMediaSession(options) {
      const { playerName, channel, appVersion } = config.mediaCollection;
      const event = eventManager.createEvent();
      const { sessionDetails } = options.xdm.mediaCollection;
      event.setUserXdm(options.xdm);
      event.mergeXdm({
        eventType: MediaEvents.SESSION_START,
        mediaCollection: {
          sessionDetails: {
            playerName: sessionDetails.playerName || playerName,
            channel: sessionDetails.channel || channel,
            appVersion: sessionDetails.appVersion || appVersion
          }
        }
      });

      return event;
    },
    augmentMediaEvent({
      event,
      playerId,
      getPlayerDetails,
      sessionID,
      eventType
    }) {
      if (!playerId || !getPlayerDetails) {
        return event;
      }
      const { playhead, qoeDataDetails } = getPlayerDetails({ playerId });

      event.mergeXdm({
        mediaCollection: {
          playhead: toInteger(playhead),
          qoeDataDetails,
          sessionID
        }
      });

      if (eventType === MediaEvents.AD_START) {
        event.mergeXdm({
          mediaCollection: {
            advertisingDetails: {
              playerName: config.mediaCollection.playerName
            }
          }
        });
      }
      return event;
    },
    trackMediaSession({ event, mediaOptions }) {
      return eventManager.sendEvent(event, { mediaOptions });
    },
    trackMediaEvent({ event, action }) {
      const mediaRequestPayload = createDataCollectionRequestPayload();
      const request = createMediaRequest({
        mediaRequestPayload,
        action
      });
      mediaRequestPayload.addEvent(event);
      event.finalize();

      return consent.awaitConsent().then(() => {
        return sendEdgeNetworkRequest({ request }).then(() => {
          return {};
        });
      });
    }
  };
};
