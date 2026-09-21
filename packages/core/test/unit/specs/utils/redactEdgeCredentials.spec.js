/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect } from "vitest";
import redactEdgeCredentials from "../../../../src/utils/redactEdgeCredentials.js";

describe("redactEdgeCredentials", () => {
  it("redacts clientSecret when edgeCredentials is present", () => {
    const result = redactEdgeCredentials({
      orgId: "abc@AdobeOrg",
      edgeCredentials: { clientId: "myClientId", clientSecret: "shh" },
    });
    expect(result).toEqual({
      orgId: "abc@AdobeOrg",
      edgeCredentials: { clientId: "myClientId", clientSecret: "[REDACTED]" },
    });
  });

  it("returns the exact same reference when edgeCredentials is absent", () => {
    const value = { orgId: "abc@AdobeOrg" };
    expect(redactEdgeCredentials(value)).toBe(value);
  });

  it("returns the exact same reference when edgeCredentials has no clientSecret", () => {
    const value = { edgeCredentials: { clientId: "myClientId" } };
    expect(redactEdgeCredentials(value)).toBe(value);
  });

  it("preserves functions elsewhere on the value, by reference", () => {
    const onBeforeEventSend = () => {};
    const result = redactEdgeCredentials({
      onBeforeEventSend,
      edgeCredentials: { clientSecret: "shh" },
    });
    expect(result.onBeforeEventSend).toBe(onBeforeEventSend);
  });

  it("does not mutate the input", () => {
    const value = { edgeCredentials: { clientSecret: "shh" } };
    redactEdgeCredentials(value);
    expect(value.edgeCredentials.clientSecret).toBe("shh");
  });

  it("handles undefined/null without throwing", () => {
    expect(redactEdgeCredentials(undefined)).toBeUndefined();
    expect(redactEdgeCredentials(null)).toBeNull();
  });
});
