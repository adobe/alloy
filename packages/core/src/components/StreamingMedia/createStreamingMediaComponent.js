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
import { noop } from "../../utils/index.js";
import validateSessionOptions from "./validateMediaSessionOptions.js";
import validateMediaEventOptions from "./validateMediaEventOptions.js";

export default ({
  config,
  trackMediaEvent,
  trackMediaSession,
  mediaResponseHandler,
}) => {
  return {
    lifecycle: {
      onBeforeEvent({ mediaOptions, onResponse = noop }) {
        if (!mediaOptions) {
          return;
        }
        const { legacy, playerId, getPlayerDetails } = mediaOptions;
        if (legacy) {
          return;
        }
        onResponse(({ response }) => {
          return mediaResponseHandler({ playerId, getPlayerDetails, response });
        });
      },
    },
    commands: {
      createMediaSession: {
        optionsValidator: (options) => validateSessionOptions({ options }),

        run: trackMediaSession,
      },

      sendMediaEvent: {
        optionsValidator: (options) => validateMediaEventOptions({ options }),

        run: (options) => {
          if (!config.streamingMedia) {
            return Promise.reject(
              new Error("Streaming media is not configured."),
            );
          }

          return trackMediaEvent(options);
        },
      },
    },
  };
};
