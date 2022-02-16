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

import { createDataCollectionRequestPayload } from "../../../../../src/utils/request";
import createEvent from "../../../../../src/core/createEvent";
import describeRequestPayload from "../../../helpers/describeRequestPayload";

describe("createDataCollectionRequestPayload", () => {
  describeRequestPayload(createDataCollectionRequestPayload);

  it("adds an identity", () => {
    const payload = createDataCollectionRequestPayload();
    payload.addIdentity("IDNS", {
      id: "ABC123"
    });
    payload.addIdentity("IDNS", {
      id: "DEF456"
    });
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
      xdm: {
        identityMap: {
          IDNS: [
            {
              id: "ABC123"
            },
            {
              id: "DEF456"
            }
          ]
        }
      }
    });
  });

  it("adds events and serializes them properly", () => {
    const payload = createDataCollectionRequestPayload();
    payload.addEvent({ xdm: { a: "b" } });
    payload.addEvent({ xdm: { c: "d" } });
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
      events: [{ xdm: { a: "b" } }, { xdm: { c: "d" } }]
    });
  });

  it("returns that document may unload if any event reports that it may unload", () => {
    const payload = createDataCollectionRequestPayload();
    const event1 = createEvent();
    payload.addEvent(event1);
    const event2 = createEvent();
    event2.documentMayUnload();
    payload.addEvent(event2);
    expect(payload.getDocumentMayUnload()).toBeTrue();
  });

  it("returns that document will not unload if no event reports that it may unload", () => {
    const payload = createDataCollectionRequestPayload();
    const event1 = createEvent();
    payload.addEvent(event1);
    const event2 = createEvent();
    payload.addEvent(event2);
    expect(payload.getDocumentMayUnload()).toBeFalse();
  });

  it("returns that document will not unload if the payload contains no events", () => {
    const payload = createDataCollectionRequestPayload();
    expect(payload.getDocumentMayUnload()).toBeFalse();
  });
});
