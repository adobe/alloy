/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

// eslint-disable-next-line no-unused-vars
import createPersonalization from "../../../../../src/components/Personalization";
import createConfig from "../../../../../src/core/config/createConfig";

describe("Personalization", () => {
  let event;
  const config = createConfig({ prehidingStyle: "" });

  const logger = {
    log() {},
    warn() {}
  };

  const payload = {
    mergeConfigOverrides() {}
  };

  const eventManager = {
    createEvent() {},
    sendEvent() {}
  };

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["expectResponse", "mergeQuery"]);
  });

  it("expects a response if event is a view start", () => {
    const isViewStart = true;
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, payload });
    expect(event.expectResponse).toHaveBeenCalled();
  });

  it("does not expect a response if event is not a view start", () => {
    const isViewStart = false;
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, payload });
    expect(event.expectResponse).not.toHaveBeenCalled();
  });
});
