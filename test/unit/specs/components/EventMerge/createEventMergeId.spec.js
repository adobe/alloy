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

import createEventMergeId from "../../../../../src/components/EventMerge/createEventMergeId";

const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

describe("EventMerge:createEventMergeId", () => {
  it("returns a UUID v4-compliant Id", () => {
    expect(uuidv4Regex.test(createEventMergeId().eventMergeId)).toBe(true);
  });

  it("doesn't return any other fields in the response", () => {
    expect(Object.keys(createEventMergeId())).toEqual(["eventMergeId"]);
  });
});
