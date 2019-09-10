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

import createPayload from "../../../../../src/core/network/createPayload";
import createEvent from "../../../../../src/components/DataCollector/createEvent";

describe("Payload", () => {
  const interactEvent = createEvent();
  interactEvent.expectResponse();
  const collectEvent = createEvent();

  it("doesn't expect a response when empty", () => {
    expect(createPayload().expectsResponse).toBe(false);
  });

  it("doesn't expect a response with one collect event", () => {
    const payload = createPayload();
    payload.addEvent(collectEvent);
    expect(payload.expectsResponse).toBe(false);
  });

  it("expects a response with one interact event", () => {
    const payload = createPayload();
    payload.addEvent(interactEvent);
    expect(payload.expectsResponse).toBe(true);
  });

  it("expects a response with lots of events", () => {
    const payload = createPayload();
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    payload.addEvent(interactEvent);
    payload.addEvent(collectEvent);
    expect(payload.expectsResponse).toBe(true);
  });

  it("doesn't expect a response with a bunch of collect Events", () => {
    const payload = createPayload();
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    payload.addEvent(collectEvent);
    expect(payload.expectsResponse).toBe(false);
  });

  it("converts to a JSON object", () => {
    const payload = createPayload();
    payload.addIdentity("MY", { id: "myid" });
    const event = createEvent();
    event.mergeData({ mykey: "myvalue" });
    payload.addEvent(event);
    payload.mergeMeta({ mymetakey: "mymetavalue" });
    expect(payload.toJSON()).toEqual({
      identityMap: {
        MY: [
          {
            id: "myid"
          }
        ]
      },
      events: [
        {
          data: {
            mykey: "myvalue"
          }
        }
      ],
      meta: {
        mymetakey: "mymetavalue"
      }
    });
  });
});
