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

import describeRequest from "../../../helpers/describeRequest";
import createConsentRequest from "../../../../../src/components/Privacy/createConsentRequest";

describe("createConsentRequest", () => {
  describeRequest(payload => createConsentRequest({ payload }));

  it("provides the appropriate action", () => {
    const payload = {};
    const request = createConsentRequest({ payload });
    expect(request.getAction()).toBe("privacy/set-consent");
  });

  it("never uses sendBeacon", () => {
    const payload = {};
    const request = createConsentRequest({ payload });
    expect(request.getUseSendBeacon()).toBeFalse();
  });
});
