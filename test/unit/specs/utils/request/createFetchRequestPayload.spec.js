/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { createFetchRequestPayload } from "../../../../../src/utils/request";
import describeRequestPayload from "../../../helpers/describeRequestPayload";

describe("createDataCollectionRequestPayload", () => {
  describeRequestPayload(createFetchRequestPayload);
  it("adds an identity", () => {
    const payload = createFetchRequestPayload();
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
    const payload = createFetchRequestPayload();
    payload.addEvent({ xdm: { a: "b" } });
    payload.addEvent({ xdm: { c: "d" } });
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
      events: [{ xdm: { a: "b" } }, { xdm: { c: "d" } }]
    });
  });
});
