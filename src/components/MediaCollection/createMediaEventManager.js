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

import MediaEvents from "./mediaConstants/mediaEvents";
import createMediaRequestPayload from "./createMediaRequestPayload";
import createMediaRequest from "./createMediaRequest";
import injectTimestamp from "../Context/injectTimestamp";
import { deepAssign, toInteger } from "../../utils";

export default ({ config, eventManager, consent, sendEdgeNetworkRequest }) => {
  return {
    createMediaEvent({ options }) {
      const { xdm = {} } = options;
      const event = { xdm };
      const timestamp = injectTimestamp(() => new Date());
      timestamp(event.xdm);

      return event;
    },
    createMediaSession(options) {
      const { playerName, channel, version } = config.mediaCollection;
      const event = eventManager.createEvent();
      event.setUserXdm(options.xdm);
      event.mergeXdm({
        eventType: MediaEvents.SESSION_START,
        mediaCollection: {
          sessionDetails: {
            playerName:
              options.xdm.mediaCollection.sessionDetails.playerName ||
              playerName,
            channel:
              options.xdm.mediaCollection.sessionDetails.channel || channel,
            appVersion:
              options.xdm.mediaCollection.sessionDetails.appVersion || version
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

      if (event.mergeXdm) {
        event.mergeXdm({
          mediaCollection: {
            playhead: toInteger(playhead),
            qoeDataDetails
          }
        });
        return event;
      }
      return deepAssign(event, {
        xdm: {
          mediaCollection: {
            playhead: toInteger(playhead),
            qoeDataDetails,
            sessionID
          }
        }
      });
    },
    trackMediaSession({ event, playerId, onBeforeMediaEvent }) {
      return eventManager.sendEvent(event, { playerId, onBeforeMediaEvent });
    },
    trackMediaEvent({ event }) {
      const action = event.xdm.eventType.split(".")[1];

      const mediaRequestPayload = createMediaRequestPayload();
      const request = createMediaRequest({
        mediaRequestPayload,
        action
      });
      mediaRequestPayload.addEvent(event);

      return consent.awaitConsent().then(() => {
        return sendEdgeNetworkRequest({ request }).then(() => {
          return {};
        });
      });
    }
  };
};
