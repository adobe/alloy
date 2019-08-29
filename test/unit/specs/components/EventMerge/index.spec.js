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

import createEventMerge from "../../../../../src/components/EventMerge";

const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe("EventMerge", () => {
  let eventMerge;
  let reactorRegisterCreateEventMergeId;

  beforeAll(() => {
    reactorRegisterCreateEventMergeId = jasmine.createSpy();
    eventMerge = createEventMerge({
      config: {
        reactorRegisterCreateEventMergeId
      }
    });
  });

  describe("lifecycle", () => {
    describe("onBeforeEvent", () => {
      it("applies an eventMergeId to the event when provided in options", done => {
        const event = {};
        const options = {
          eventMergeId: "ABC123"
        };
        eventMerge.lifecycle.onBeforeEvent(event, options).then(() => {
          expect(event.eventMergeId).toBe("ABC123");
          done();
        });
      });

      it("applies an eventMergeId to the event when promise provided in options", done => {
        const event = {};
        const options = {
          eventMergeId: Promise.resolve("ABC123")
        };
        eventMerge.lifecycle.onBeforeEvent(event, options).then(() => {
          expect(event.eventMergeId).toBe("ABC123");
          done();
        });
      });

      it("does not apply an eventMergeId to the event when not provided in options", done => {
        const event = {};
        const options = {};
        eventMerge.lifecycle.onBeforeEvent(event, options).then(() => {
          expect(event.eventMergeId).toBeUndefined();
          done();
        });
      });
    });
  });

  describe("commands", () => {
    describe("createEventMergeId", () => {
      it("returns a UUID v4-compliant Id", () => {
        expect(uuidv4Regex.test(eventMerge.commands.createEventMergeId())).toBe(
          true
        );
      });
    });
  });

  describe("reactor-specific functionality", () => {
    it("registers a function for creating an event merge ID", () => {
      const createEventMergeId = reactorRegisterCreateEventMergeId.calls.first()
        .args[0];
      expect(uuidv4Regex.test(createEventMergeId())).toBe(true);
    });
  });
});
