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

import validateMediaSessionOptions from "../../../../../src/components/StreamingMedia/validateMediaSessionOptions";

describe("StreamingMedia::validateMediaSessionOptions", () => {
  it("should not fail when playerId, callback and xdm are used", () => {
    const options = {
      playerId: "playerId",
      getPlayerDetails: () => {},
      xdm: {
        eventType: "eventType",
        mediaCollection: {
          sessionDetails: {}
        }
      }
    };

    expect(() => {
      validateMediaSessionOptions({ options });
    }).not.toThrowError();
  });

  it("should not fail when playerId, callback and xdm are used", () => {
    const options = {
      xdm: {
        eventType: "eventType",
        mediaCollection: {
          playhead: 0,
          sessionDetails: {}
        }
      }
    };

    expect(() => {
      validateMediaSessionOptions({ options });
    }).not.toThrowError();
  });

  it("should throw an error when invalid options are passed", () => {
    const options = {
      xdm: {
        eventType: "eventType",
        mediaCollection: {
          playhead: "0",
          sessionID: "sessionID"
        }
      }
    };

    expect(() => {
      validateMediaSessionOptions({ options });
    }).toThrowError();
  });
});
