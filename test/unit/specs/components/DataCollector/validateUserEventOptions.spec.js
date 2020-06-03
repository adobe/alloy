/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import validateUserEventOptions from "../../../../../src/components/DataCollector/validateUserEventOptions";

describe("DataCollector::validateUserEventOptions", () => {
  it("throws error for invalid options", () => {
    [
      undefined,
      { xdm: [] },
      { renderDecisions: "" },
      { data: [] },
      { decisionScopes: {} },
      { datasetId: 3634 }
    ].forEach(options => {
      expect(() => {
        validateUserEventOptions({ options });
      }).toThrowError();
    });
  });
  it("logs warning when event type is required and missing", () => {
    const options = { xdm: { test: "" } };
    const logger = {
      warn: jasmine.createSpy()
    };
    validateUserEventOptions({ options, logger });
    expect(logger.warn).toHaveBeenCalledWith(
      "No type or xdm.eventType specified."
    );
  });
  it("does not throw errors when event options are valid", () => {
    [
      {},
      { xdm: { eventType: "test" } },
      { type: "test", xdm: { test: "" } },
      { renderDecisions: true },
      { data: { test: "" } },
      { renderDecisions: true, data: { test: "" } },
      { decisionScopes: ["test"] },
      { datasetId: "12432ewfr12" }
    ].forEach(options => {
      expect(() => {
        validateUserEventOptions({ options });
      }).not.toThrowError();
    });
  });
});
