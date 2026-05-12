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
import configValidators from "../../../../../src/components/BrandConcierge/configValidators.js";
import testConfigValidators from "../../../helpers/testConfigValidators.js";

describe("BrandConcierge configValidators", () => {
  testConfigValidators({
    configValidators,
    validConfigurations: [
      {},
      { conversation: {} },
      { conversation: { region: "va7" } },
      { conversation: { region: "or2" } },
      { conversation: { region: "irl1" } },
      // format-valid but not in any hardcoded list — must be accepted without an SDK release
      { conversation: { region: "zz1" } },
      { conversation: { stickyConversationSession: true } },
      {
        conversation: {
          region: "va7",
          stickyConversationSession: true,
          collectSources: false,
        },
      },
    ],
    invalidConfigurations: [
      { conversation: { region: "invalid-region" } },
      { conversation: { region: "123" } },
      { conversation: { region: "a" } },
    ],
    defaultValues: {},
  });

  it("accepts undefined region (optional field)", () => {
    const result = configValidators({ conversation: {} });
    expect(result.conversation.region).toBeUndefined();
  });
});
