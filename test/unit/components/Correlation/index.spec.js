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

import createCorrelation from "../../../../src/components/Correlation";

const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe("Correlation", () => {
  let correlation;

  beforeAll(() => {
    correlation = createCorrelation();
  });

  describe("lifecycle", () => {
    describe("onBeforeEvent", () => {
      it("applies a correlationID to the event when provided in options", done => {
        const event = {};
        const options = {
          correlationID: "ABC123"
        };
        correlation.lifecycle.onBeforeEvent(event, options).then(() => {
          expect(event.correlationID).toBe("ABC123");
          done();
        });
      });

      it("applies a correlationID to the event when promise provided in options", done => {
        const event = {};
        const options = {
          correlationID: Promise.resolve("ABC123")
        };
        correlation.lifecycle.onBeforeEvent(event, options).then(() => {
          expect(event.correlationID).toBe("ABC123");
          done();
        });
      });

      it("does not apply a correlationID to the event when not provided in options", done => {
        const event = {};
        const options = {};
        correlation.lifecycle.onBeforeEvent(event, options).then(() => {
          expect(event.correlationID).toBeUndefined();
          done();
        });
      });
    });
  });

  describe("commands", () => {
    describe("createCorrelationID", () => {
      it("returns a UUID v4-compliant ID", () => {
        expect(
          uuidv4Regex.test(correlation.commands.createCorrelationID())
        ).toBe(true);
      });
    });
  });
});
