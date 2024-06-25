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

import createEventMergeId from "../../../../../src/components/EventMerge/createEventMergeId.js";
import uuidV4Regex from "../../../constants/uuidV4Regex.js";

describe("EventMerge:createEventMergeId", () => {
  it("returns a UUID v4-compliant Id", () => {
    expect(uuidV4Regex.test(createEventMergeId().eventMergeId)).toBe(true);
  });

  it("doesn't return any other fields in the response", () => {
    expect(Object.keys(createEventMergeId())).toEqual(["eventMergeId"]);
  });
});
