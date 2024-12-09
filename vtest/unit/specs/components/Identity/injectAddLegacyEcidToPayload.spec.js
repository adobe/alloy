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

import { vi, beforeEach, describe, it, expect } from "vitest";
import injectAddLegacyEcidToPayload from "../../../../../src/components/Identity/injectAddLegacyEcidToPayload.js";

describe("Identity::injectAddLegacyEcidToPayload", () => {
  let getLegacyEcid;
  let addEcidToPayload;
  let payload;
  let addLegacyEcidToPayload;
  beforeEach(() => {
    getLegacyEcid = vi.fn().mockReturnValue(Promise.resolve("legacy@adobe"));
    addEcidToPayload = vi.fn();
    addLegacyEcidToPayload = injectAddLegacyEcidToPayload({
      getLegacyEcid,
      addEcidToPayload,
    });
    payload = {
      hasIdentity: vi.fn(),
    };
  });
  it("does not add legacy ECID to payload if legacy ECID does not exist", () => {
    payload.hasIdentity.mockReturnValue(false);
    getLegacyEcid.mockReturnValue(Promise.resolve());
    return addLegacyEcidToPayload(payload).then(() => {
      expect(addEcidToPayload).not.toHaveBeenCalled();
    });
  });
  it("adds legacy ECID to payload if legacy ECID exists", () => {
    payload.hasIdentity.mockReturnValue(false);
    return addLegacyEcidToPayload(payload).then(() => {
      expect(addEcidToPayload).toHaveBeenCalledWith(payload, "legacy@adobe");
    });
  });
  it("does not add legacy ECID to payload if the payload already has an ecid", async () => {
    payload.hasIdentity.mockReturnValue(true);
    const response = await addLegacyEcidToPayload(payload);
    expect(getLegacyEcid).not.toHaveBeenCalled();
    expect(response).toBeUndefined();
  });
});
