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

import injectExtractEdgeInfo from "../../../../../src/core/edgeNetwork/injectExtractEdgeInfo.js";

describe("extractEdgeInfo", () => {
  let logger;
  let extractEdgeInfo;
  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn"]);
    extractEdgeInfo = injectExtractEdgeInfo({ logger });
  });

  [undefined, ""].forEach((input) => {
    it(`doesn't log for missing header "${input}"`, () => {
      expect(extractEdgeInfo(input)).toEqual({});
      expect(logger.warn).not.toHaveBeenCalled();
    });
  });

  ["OR2", "VA6;", "VA6;bad"].forEach((input) => {
    it(`handles invalid header "${input}"`, () => {
      expect(extractEdgeInfo(input)).toEqual({});
      expect(logger.warn).toHaveBeenCalled();
    });
  });

  [
    ["OR2;9", { regionId: 9 }],
    ["OR2;9;other info", { regionId: 9 }],
    ["OR2;011", { regionId: 11 }],
    ["VA7;-1", { regionId: -1 }],
  ].forEach(([input, expectedOutput]) => {
    it(`parses "${input}" correctly`, () => {
      expect(extractEdgeInfo(input)).toEqual(expectedOutput);
    });
  });
});
