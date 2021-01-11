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

import createConsentRequestPayload from "../../../../../src/components/Privacy/createConsentRequestPayload";
import describeRequestPayload from "../../../helpers/describeRequestPayload";

describe("createConsentRequestPayload", () => {
  describeRequestPayload(createConsentRequestPayload);

  it("adds an identity", () => {
    const payload = createConsentRequestPayload();
    payload.addIdentity("IDNS", {
      id: "ABC123"
    });
    payload.addIdentity("IDNS", {
      id: "DEF456"
    });
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
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
    });
  });

  it("sets consent", () => {
    const payload = createConsentRequestPayload();
    payload.setConsent([
      {
        standard: "Adobe",
        version: "1.0",
        value: {
          general: "in"
        }
      }
    ]);
    expect(JSON.parse(JSON.stringify(payload))).toEqual({
      consent: [
        {
          standard: "Adobe",
          version: "1.0",
          value: {
            general: "in"
          }
        }
      ]
    });
  });
});
