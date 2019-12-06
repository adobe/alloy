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

import createDataCollectionRequestPayload from "../../../../../../src/core/edgeNetwork/requestPayloads/createDataCollectionRequestPayload";
import createEvent from "../../../../../../src/core/createEvent";

describe("createDataCollectionRequestPayload", () => {
  const interactEvent = createEvent();
  interactEvent.setUserXdm({
    a: "b"
  });
  interactEvent.expectResponse();
  const collectEvent = createEvent();
  collectEvent.setUserXdm({
    c: "d"
  });

  it("doesn't expect a response when empty", () => {
    expect(
      createDataCollectionRequestPayload().getExpectResponse()
    ).toBeFalse();
  });

  it("doesn't expect a response with one collect event", () => {
    const payload = createDataCollectionRequestPayload();
    payload.addEvent(collectEvent);
    expect(payload.getExpectResponse()).toBeFalse();
  });

  it("expects a response when expectResponse is called", () => {
    const payload = createDataCollectionRequestPayload();
    payload.expectResponse();
    expect(payload.getExpectResponse()).toBeTrue();
  });

  it("expects a response with one interact event", () => {
    const payload = createDataCollectionRequestPayload();
    payload.addEvent(interactEvent);
    expect(payload.getExpectResponse()).toBeTrue();
  });

  it("expects a response with a lot of events including at least one interact event", () => {
    const payload = createDataCollectionRequestPayload();
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    payload.addEvent(interactEvent);
    payload.addEvent(collectEvent);
    expect(payload.getExpectResponse()).toBeTrue();
  });

  it("doesn't expect a response with a lot of collect Events", () => {
    const payload = createDataCollectionRequestPayload();
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    expect(payload.getExpectResponse()).toBeFalse();
  });

  it("should not use ID third-party domain when useIdThirdPartyDomain is not called", () => {
    const payload = createDataCollectionRequestPayload();
    expect(payload.getUseIdThirdPartyDomain()).toBeFalse();
  });

  it("should use ID third-party domain when useIdThirdPartyDomain is called", () => {
    const payload = createDataCollectionRequestPayload();
    payload.useIdThirdPartyDomain();
    expect(payload.getUseIdThirdPartyDomain()).toBeTrue();
  });

  it("calls toJSON on the event when it is added to the payload", () => {
    const payload = createDataCollectionRequestPayload();
    const event = {
      toJSON: jasmine.createSpy(),
      getExpectResponse() {
        return true;
      }
    };
    payload.addEvent(event);
    expect(event.toJSON).toHaveBeenCalled();
  });

  it("serializes properly", () => {
    const payload = createDataCollectionRequestPayload();
    payload.mergeConfigOverrides({
      testOverride: "testOverrideValue"
    });
    payload.mergeState({
      testState: "testStateValue"
    });
    payload.useIdThirdPartyDomain();
    payload.addIdentity("IDNS", {
      id: "ABC123"
    });
    payload.addEvent(interactEvent);
    payload.addEvent(collectEvent);
    expect(payload.toJSON()).toEqual({
      meta: {
        configOverrides: {
          testOverride: "testOverrideValue"
        },
        state: {
          testState: "testStateValue"
        }
      },
      xdm: {
        identityMap: {
          IDNS: [
            {
              id: "ABC123"
            }
          ]
        }
      },
      events: [{ xdm: { a: "b" } }, { xdm: { c: "d" } }]
    });
  });
});
