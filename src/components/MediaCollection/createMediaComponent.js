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
import { noop } from "../../utils";
import validateSessionOptions from "./validateMediaSessionOptions";
import validateMediaEventOptions from "./validateMediaEventOptions";

export default ({
  config,
  logger,
  trackMediaEvent,
  trackMediaSession,
  onBeforeMediaEvent
}) => {
  return {
    lifecycle: {
      onBeforeEvent({ mediaOptions, onResponse = noop }) {
        const { legacy, playerId, getPlayerDetails } = mediaOptions;
        if (legacy) {
          return;
        }
        onResponse(({ response }) => {
          return onBeforeMediaEvent({ playerId, getPlayerDetails, response });
        });
      }
    },
    commands: {
      createMediaSession: {
        optionsValidator: options => validateSessionOptions({ options }),

        run: options => trackMediaSession(options)
      },

      sendMediaEvent: {
        optionsValidator: options => validateMediaEventOptions({ options }),

        run: options => {
          if (!config.mediaCollection) {
            logger.warn("Media Collection is not configured.");

            return Promise.resolve();
          }

          const { xdm } = options;
          const eventType = xdm.eventType;

          return trackMediaEvent(options).catch(error => {
            logger.warn(`The Media Event of type ${eventType} failed.`, error);
          });
        }
      }
    }
  };
};
