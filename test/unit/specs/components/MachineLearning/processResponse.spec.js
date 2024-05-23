/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import processResponse from "../../../../../src/components/MachineLearning/processResponse.js";

describe("processResponse", () => {
  let response;

  beforeEach(() => {
    response = jasmine.createSpyObj("response", {
      getPayloadsByType: [
        {
          "xdm.path.1": 0.12,
        },
        {
          "xdm.path.2": 0.3,
        },
      ],
    });
  });

  it("pulls inferences out of the response if available", () => {
    expect(processResponse({ response })).toEqual({
      inferences: [
        {
          "xdm.path.1": 0.12,
        },
        {
          "xdm.path.2": 0.3,
        },
      ],
    });
  });

  it("returns [] if no inferences were found", () => {
    const responseWithNoInferences = jasmine.createSpyObj("response", {
      getPayloadsByType: [],
    });

    expect(processResponse({ response: responseWithNoInferences })).toEqual({
      inferences: [],
    });
  });
});
