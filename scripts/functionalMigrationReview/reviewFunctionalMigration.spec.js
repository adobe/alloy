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

import { describe, expect, test } from "vitest";
import {
  compareCaseGroups,
  inventorySource,
  selectFunctionalCases,
} from "./reviewFunctionalMigration.js";

describe("functional migration review", () => {
  test("inherits a case ID from the nearest describe block", () => {
    const inventory = inventorySource({
      file: "consent.spec.js",
      source: `
        describe("C2594: sendEvent resolves when consent is out", () => {
          test("returns an empty result", async ({ alloy }) => {
            await alloy("configure", { defaultConsent: "pending" });
            expect(await alloy("sendEvent")).toEqual({});
          });
        });
      `,
      suite: "integration",
    });

    expect(inventory.cases).toHaveLength(1);
    expect(inventory.cases[0]).toMatchObject({
      id: "C2594",
      skipped: false,
      title: "returns an empty result",
    });
    expect(inventory.cases[0].source).toContain(
      'expect(await alloy("sendEvent")).toEqual({})',
    );
  });

  test("normalizes legacy and integration Alloy commands", () => {
    const functional = inventorySource({
      file: "C2593.js",
      source: `
        test("C2593 queues an event", async () => {
          await alloy.configure(consentPending);
          const response = await alloy.sendEventAsync({ xdm: payload });
          await alloy.setConsent(CONSENT_IN);
          await response.result;
        });
      `,
      suite: "functional",
    });
    const integration = inventorySource({
      file: "consent.spec.js",
      source: `
        test("C2593 queues an event", async ({ alloy }) => {
          await alloy("configure", { defaultConsent: "pending" });
          const response = alloy("sendEvent");
          await alloy("setConsent", CONSENT_IN);
          await response;
          const alloy2 = await reloadAlloy();
          await alloy2("sendEvent");
        });
      `,
      suite: "integration",
    });

    expect(functional.cases[0].commands.map(({ name }) => name)).toEqual([
      "configure",
      "sendEvent",
      "setConsent",
    ]);
    expect(integration.cases[0].commands.map(({ name }) => name)).toEqual([
      "configure",
      "sendEvent",
      "setConsent",
      "sendEvent",
    ]);
  });

  test("does not classify Alloy response helpers as SDK commands", () => {
    const inventory = inventorySource({
      file: "C2594.js",
      source: `
        test("C2594 handles consent", async () => {
          const alloyResponse = await alloy.sendEvent();
          alloyResponse.getPayloadsByType("identity:result");
          alloyResponse.finish();
        });
      `,
      suite: "functional",
    });

    expect(inventory.cases[0].commands.map(({ name }) => name)).toEqual([
      "sendEvent",
    ]);
  });

  test("finds chained TestCafe tests and assertion helpers", () => {
    const inventory = inventorySource({
      file: "C14414.js",
      source: `
        test
          .before(async () => {})
          .after(async () => {})("Test C14414 queues requests", async () => {
            await alloy.configure(config);
            await responseStatus(requests, [200, 207]);
          });
      `,
      suite: "functional",
    });

    expect(inventory.cases).toHaveLength(1);
    expect(inventory.cases[0]).toMatchObject({
      id: "C14414",
      skipped: false,
      title: "Test C14414 queues requests",
    });
    expect(inventory.cases[0].assertions).toHaveLength(1);
  });

  test("does not compare unreachable bodies when a skip is preserved", () => {
    const functional = inventorySource({
      file: "C1576777.js",
      source: `
        test.skip("C1576777 clears stored consent", async () => {
          await alloy.configure(config);
          await t.expect(requests.length).eql(2);
        });
      `,
      suite: "functional",
    });
    const integration = inventorySource({
      file: "consent.spec.js",
      source: `
        test.skip("C1576777 clears stored consent", () => {});
      `,
      suite: "integration",
    });

    expect(
      compareCaseGroups(functional.cases, integration.cases)[0],
    ).toMatchObject({
      findings: [],
      status: "green",
    });
  });

  test("recognizes media IDs and concatenated skipped titles", () => {
    const media = inventorySource({
      file: "MA3.js",
      source: `test("MA3 routes media events", async () => {});`,
      suite: "functional",
    });
    const visitor = inventorySource({
      file: "visitor.spec.js",
      source: `
        test.skip(
          "C35448 waits for Visitor " +
            "(requires Visitor.js)",
          async () => {},
        );
      `,
      suite: "integration",
    });

    expect(media.cases[0].id).toBe("MA3");
    expect(visitor.cases[0]).toMatchObject({
      id: "C35448",
      skipped: true,
      title: "C35448 waits for Visitor (requires Visitor.js)",
    });
  });

  test("does not treat conditional Vitest APIs as unconditional skips", () => {
    const inventory = inventorySource({
      file: "conditional.spec.js",
      source: `test.runIf(true)("C123 runs conditionally", () => {});`,
      suite: "integration",
    });

    expect(inventory.cases[0].skipped).toBe(false);
  });

  test("only flags known async and state helper names as risks", () => {
    const inventory = inventorySource({
      file: "C123.js",
      source: `
        test("C123 loads and reloads", async () => {
          await preloadAssets();
          await reloadPage();
          await getCookieValue("identity");
          await waitForRequest();
        });
      `,
      suite: "functional",
    });

    expect(inventory.cases[0].risks.map(({ text }) => text)).toEqual([
      "reloadPage()",
      'getCookieValue("identity")',
      "waitForRequest()",
    ]);
  });

  test("scopes a branch from migrated IDs and historical deletions", () => {
    const allFunctionalCases = [
      { file: "functional/C1.js", id: "C1" },
      { file: "functional/C2.js", id: "C2" },
      { file: "functional/C2.js", id: "C3" },
      { file: "functional/C4.js", id: "C4" },
    ];
    const migratedCases = [{ id: "C1" }];

    expect(
      selectFunctionalCases({
        allFunctionalCases,
        historicallyDeletedFiles: ["functional/C2.js"],
        migratedCases,
      }).map(({ id }) => id),
    ).toEqual(["C1", "C2", "C3"]);
  });

  test("includes every case in a partially migrated functional file", () => {
    const allFunctionalCases = [
      { file: "functional/shared.js", id: "C1" },
      { file: "functional/shared.js", id: "C2" },
      { file: "functional/other.js", id: "C3" },
    ];

    expect(
      selectFunctionalCases({
        allFunctionalCases,
        historicallyDeletedFiles: [],
        migratedCases: [{ id: "C1" }],
      }).map(({ id }) => id),
    ).toEqual(["C1", "C2"]);
  });

  test("flags the assertion and state transition dropped by the initial C2660 migration", () => {
    const functional = inventorySource({
      file: "C2660.js",
      source: `
        test("C2660 - Context data is captured before user consents.", async () => {
          await alloy.configure(consentPending);
          const response = await alloy.sendEventAsync();
          await t.eval(() => {
            window.location.hash = "foo";
          });
          await alloy.setConsent(CONSENT_IN);
          await response.result;
          await alloy.sendEvent();
          await t.expect(requests.length).eql(2);
          await t.expect(getContextUrlFromRequest(requests[0])).eql(TEST_PAGE_URL);
          await t.expect(getContextUrlFromRequest(requests[1])).eql(\`${"${TEST_PAGE_URL}"}#foo\`);
        });
      `,
      suite: "functional",
    });
    const integration = inventorySource({
      file: "consent.spec.js",
      source: `
        test("C2660: sendEvent queued before consent fires", async ({ alloy }) => {
          await alloy("configure", { defaultConsent: "pending" });
          const response = alloy("sendEvent");
          await alloy("setConsent", CONSENT_IN);
          await response;
          await alloy("sendEvent");
          const calls = await networkRecorder.findCalls(/v1\\/interact/);
          expect(calls.length).toBe(2);
        });
      `,
      suite: "integration",
    });

    const comparison = compareCaseGroups(
      functional.cases,
      integration.cases,
    )[0];

    expect(comparison.status).toBe("red");
    expect(comparison.findings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("state operation"),
        expect.stringContaining("3 assertions to 1"),
      ]),
    );
  });
});
