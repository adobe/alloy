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
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../../src/view/utils/fetchFromReactor");

import updateRuleComponent from "../../../../src/view/utils/updateRuleComponent";

import fetchFromReactor from "../../../../src/view/utils/fetchFromReactor";

import UserReportableError from "../../../../src/view/errors/userReportableError";

describe("updateRuleComponent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("PATCHes the rule_component with stringified settings under JSON:API envelope", async () => {
    fetchFromReactor.mockResolvedValueOnce({
      status: 200,
      parsedBody: {
        data: {
          id: "RC1",
          attributes: { settings: JSON.stringify({ dataElementId: "DE9" }) },
        },
      },
    });

    const result = await updateRuleComponent({
      orgId: "ORG",
      imsAccess: "TOKEN",
      ruleComponentId: "RC1",
      settings: { dataElementId: "DE9", dataElementName: "My Variable" },
    });

    expect(fetchFromReactor).toHaveBeenCalledTimes(1);
    const callArg = fetchFromReactor.mock.calls[0][0];
    expect(callArg.method).toBe("PATCH");
    expect(callArg.path).toBe("/rule_components/RC1");
    expect(callArg.body).toEqual({
      data: {
        id: "RC1",
        type: "rule_components",
        attributes: {
          settings: JSON.stringify({
            dataElementId: "DE9",
            dataElementName: "My Variable",
          }),
        },
      },
    });
    expect(result).toEqual({ id: "RC1", settings: { dataElementId: "DE9" } });
  });

  it("falls back to the requested ruleComponentId and settings when the response is empty (204)", async () => {
    fetchFromReactor.mockResolvedValueOnce({
      status: 204,
      parsedBody: null,
    });

    const result = await updateRuleComponent({
      orgId: "ORG",
      imsAccess: "TOKEN",
      ruleComponentId: "RC42",
      settings: { dataElementId: "DE1" },
    });

    expect(result).toEqual({ id: "RC42", settings: { dataElementId: "DE1" } });
  });

  it("rethrows AbortError unwrapped", async () => {
    const abortError = Object.assign(new Error("aborted"), {
      name: "AbortError",
    });
    fetchFromReactor.mockRejectedValueOnce(abortError);

    await expect(
      updateRuleComponent({
        orgId: "ORG",
        imsAccess: "TOKEN",
        ruleComponentId: "RC1",
        settings: {},
      }),
    ).rejects.toBe(abortError);
  });

  it("wraps non-abort errors in UserReportableError", async () => {
    const inner = new Error("boom");
    fetchFromReactor.mockRejectedValueOnce(inner);

    const promise = updateRuleComponent({
      orgId: "ORG",
      imsAccess: "TOKEN",
      ruleComponentId: "RC1",
      settings: {},
    });

    await expect(promise).rejects.toBeInstanceOf(UserReportableError);
    await expect(promise).rejects.toMatchObject({
      message: "Failed to update rule component.",
      originatingError: inner,
    });
  });
});
