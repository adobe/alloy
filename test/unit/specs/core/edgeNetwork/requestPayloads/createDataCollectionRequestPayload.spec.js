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
  let interactEvent;
  let collectEvent;

  beforeEach(() => {
    interactEvent = createEvent();
    interactEvent.setUserXdm({
      a: "b"
    });
    collectEvent = createEvent();
    collectEvent.setUserXdm({
      c: "d"
    });
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

  it("returns false from getDocumentMayUnload if no events say document may unload", () => {
    const payload = createDataCollectionRequestPayload();
    const event = {
      getDocumentMayUnload() {
        return false;
      }
    };
    payload.addEvent(event);
    expect(payload.getDocumentMayUnload()).toBeFalse();
  });

  it("returns true from getDocumentMayUnload if at least one event reports the document may unload", () => {
    const payload = createDataCollectionRequestPayload();
    const event1 = {
      getDocumentMayUnload() {
        return false;
      }
    };
    const event2 = {
      getDocumentMayUnload() {
        return true;
      }
    };
    payload.addEvent(event1);
    payload.addEvent(event2);
    expect(payload.getDocumentMayUnload()).toBeTrue();
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
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
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
