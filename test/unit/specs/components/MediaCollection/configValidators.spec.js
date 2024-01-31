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

import configValidators from "../../../../../src/components/MediaCollection/configValidators";
import testConfigValidators from "../../../helpers/testConfigValidators";

describe("MediaCollection config validators", () => {
  testConfigValidators({
    configValidators,
    validConfigurations: [
      {},
      {
        mediaCollection: {
          channel: "test-channel",
          playerName: "test-player-name"
        }
      },
      {
        mediaCollection: {
          channel: "test-channel",
          playerName: "test-player-name",
          appVersion: "test-app-version"
        }
      },
      {
        mediaCollection: {
          channel: "test-channel",
          playerName: "test-player-name",
          appVersion: "test-app-version",
          mainPingInterval: 10,
          adPingInterval: 1
        }
      }
    ],
    invalidConfigurations: [
      { mediaCollection: "" },
      { mediaCollection: {} },
      { mediaCollection: { channel: "test-channel" } },
      { mediaCollection: { playerName: "test-player-name" } }
    ],
    defaultValues: {}
  });

  it("provides default values when Media Collection configured", () => {
    const config = configValidators({
      mediaCollection: {
        channel: "test-channel",
        playerName: "test-player-name"
      }
    });
    expect(config.mediaCollection.adPingInterval).toBe(10);
    expect(config.mediaCollection.mainPingInterval).toBe(10);
  });
});
