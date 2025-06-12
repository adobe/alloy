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

import { vi, beforeEach, describe, it, expect } from "vitest";
import injectProcessResponse from "../../../../../src/components/Audiences/injectProcessResponse.js";

describe("injectProcessResponse", () => {
  let response;
  let processResponse;
  let processDestinations;
  beforeEach(() => {
    processDestinations = vi.fn().mockReturnValue(Promise.resolve());
    processResponse = injectProcessResponse({
      processDestinations,
    });
    response = {
      getPayloadsByType: vi.fn().mockReturnValue(["An Edge Destination"]),
    };
  });
  it("fetches destinations from the response", () => {
    return processResponse({
      response,
    }).then((result) => {
      expect(processDestinations).toHaveBeenCalled();
      expect(result).toEqual({
        destinations: ["An Edge Destination"],
      });
    });
  });
  it("returns [] if no destinations were found", () => {
    const responseWithNoDestinations = {
      getPayloadsByType: vi.fn().mockReturnValue([]),
    };
    return processResponse({
      response: responseWithNoDestinations,
    }).then((result) => {
      expect(result).toEqual({
        destinations: [],
      });
    });
  });
});
