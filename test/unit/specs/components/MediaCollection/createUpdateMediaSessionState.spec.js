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

import createUpdateMediaSessionState from "../../../../../src/components/MediaCollection/createUpdateMediaSessionState";
import MediaEvents from "../../../../../src/components/MediaCollection/constants/eventTypes";

describe("MediaCollection::createUpdateMediaSessionState", () => {
  let mediaSessionCacheManager;
  let updateSessionState;

  beforeEach(() => {
    mediaSessionCacheManager = jasmine.createSpyObj(
      "mediaSessionCacheManager",
      ["stopHeartbeat", "updateLastTriggeredEventTS"]
    );
    updateSessionState = createUpdateMediaSessionState({
      mediaSessionCacheManager
    });
  });

  it("should stop the heart beat when session completes", () => {
    updateSessionState({
      playerId: "playerId",
      eventType: MediaEvents.SESSION_COMPLETE
    });

    expect(mediaSessionCacheManager.stopHeartbeat).toHaveBeenCalled();
    expect(
      mediaSessionCacheManager.updateLastTriggeredEventTS
    ).toHaveBeenCalled();
  });

  it("should update the last event when session is ongoing", () => {
    updateSessionState({ playerId: "playerId", eventType: MediaEvents.PLAY });

    expect(mediaSessionCacheManager.stopHeartbeat).not.toHaveBeenCalled();
    expect(
      mediaSessionCacheManager.updateLastTriggeredEventTS
    ).toHaveBeenCalled();
  });
});
