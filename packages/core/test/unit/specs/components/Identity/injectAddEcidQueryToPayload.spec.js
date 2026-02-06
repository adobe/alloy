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

import { vi, describe, it, expect } from "vitest";
import injectAddEcidQueryToPayload from "../../../../../src/components/Identity/injectAddEcidQueryToPayload.js";

describe("Identity::addEcidQueryToPayload", () => {
  it("adds an ECID & CORE query to the event when third party cookies are enabled on Chrome", () => {
    const addEcidQueryToPayload = injectAddEcidQueryToPayload({
      thirdPartyCookiesEnabled: true,
      areThirdPartyCookiesSupportedByDefault: () => true,
    });
    const payload = {
      mergeQuery: vi.fn(),
    };
    addEcidQueryToPayload(payload);
    expect(payload.mergeQuery).toHaveBeenCalledWith({
      identity: {
        fetch: ["ECID", "CORE"],
      },
    });
  });
  it("adds only ECID query to the event when third party cookies are enabled on Safari", () => {
    const addEcidQueryToPayload = injectAddEcidQueryToPayload({
      thirdPartyCookiesEnabled: true,
      areThirdPartyCookiesSupportedByDefault: () => false,
    });
    const payload = {
      mergeQuery: vi.fn(),
    };
    addEcidQueryToPayload(payload);
    expect(payload.mergeQuery).toHaveBeenCalledWith({
      identity: {
        fetch: ["ECID"],
      },
    });
  });
  it("adds an ECID query to the event when third party cookies are disabled on Chrome", () => {
    const addEcidQueryToPayload = injectAddEcidQueryToPayload({
      thirdPartyCookiesEnabled: false,
      areThirdPartyCookiesSupportedByDefault: () => true,
    });
    const payload = {
      mergeQuery: vi.fn(),
    };
    addEcidQueryToPayload(payload);
    expect(payload.mergeQuery).toHaveBeenCalledWith({
      identity: {
        fetch: ["ECID"],
      },
    });
  });
});
