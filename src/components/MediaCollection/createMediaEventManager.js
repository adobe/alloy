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
      const { playerName, channel, version } = config.mediaCollection;
      const event = eventManager.createEvent();
      const { sessionDetails } = options.xdm.mediaCollection;
      event.setUserXdm(options.xdm);
      event.mergeXdm({
        eventType: MediaEvents.SESSION_START,
        mediaCollection: {
          sessionDetails: {
            playerName: sessionDetails.playerName || playerName,
            channel: sessionDetails.channel || channel,
            appVersion: sessionDetails.appVersion || version
          }
        }
      });

      return event;
    },
    augmentMediaEvent({ event, playerId, onBeforeMediaEvent, sessionID }) {
      if (!playerId || !onBeforeMediaEvent) {
        return event;
      }
      const { playhead, qoeDataDetails } = onBeforeMediaEvent({ playerId });

      event.mergeXdm({
        mediaCollection: {
          playhead: toInteger(playhead),
          qoeDataDetails,
          sessionID
        }
      });
      return event;
    },
    trackMediaSession({ event, playerId, onBeforeMediaEvent }) {
      return eventManager.sendEvent(event, { playerId, onBeforeMediaEvent });
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
