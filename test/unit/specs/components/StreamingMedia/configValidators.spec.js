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

import configValidators from "../../../../../src/components/StreamingMedia/configValidators";
import testConfigValidators from "../../../helpers/testConfigValidators";

describe("Streaming Media config validators", () => {
  testConfigValidators({
    configValidators,
    validConfigurations: [
      {},
      {
        streamingMedia: {
          channel: "test-channel",
          playerName: "test-player-name"
        }
      },
      {
        streamingMedia: {
          channel: "test-channel",
          playerName: "test-player-name",
          appVersion: "test-app-version"
        }
      },
      {
        streamingMedia: {
          channel: "test-channel",
          playerName: "test-player-name",
          appVersion: "test-app-version",
          mainPingInterval: 10,
          adPingInterval: 1
        }
      }
    ],
    invalidConfigurations: [
      { streamingMedia: "" },
      { streamingMedia: {} },
      { streamingMedia: { channel: "test-channel" } },
      { streamingMedia: { playerName: "test-player-name" } }
    ],
    defaultValues: {}
  });

  it("provides default values when Streaming media configured", () => {
    const config = configValidators({
      streamingMedia: {
        channel: "test-channel",
        playerName: "test-player-name"
      }
    });
    expect(config.streamingMedia.adPingInterval).toBe(10);
    expect(config.streamingMedia.mainPingInterval).toBe(10);
  });
});
