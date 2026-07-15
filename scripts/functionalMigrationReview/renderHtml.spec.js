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
import { renderHtml } from "./renderHtml.js";

const createTestCase = ({ file, source, suite, title }) => ({
  assertions: [],
  commands: [],
  file,
  id: "C2594",
  line: 4,
  risks: [],
  skipped: false,
  source,
  stateOperations: [],
  suite,
  title,
});

describe("functional migration HTML report", () => {
  test("renders a self-contained, escaped, interactive source diff", async () => {
    const html = await renderHtml({
      baseRef: "main",
      branchRef: 'migration/<script>alert("branch")</script>',
      comparisons: [
        {
          findings: ["Assertion count decreased from 2 to 1."],
          id: "C2594",
          migrated: [
            createTestCase({
              file: "integration/consent.spec.js",
              source: 'test("new", () => expect(true).toBe(true));',
              suite: "integration",
              title: "new behavior",
            }),
          ],
          original: [
            createTestCase({
              file: "functional/C2594.js",
              source: 'test("old", () => expect(true).toBe(false));',
              suite: "functional",
              title: "old behavior",
            }),
          ],
          status: "red",
        },
      ],
      functionalFiles: ["functional/C2594.js"],
      functionalPath: "functional (branch scope)",
      integrationFiles: ["integration/consent.spec.js"],
      integrationPath: "integration (changed files)",
      unassigned: { functional: [], integration: [] },
    });

    expect(html).toContain("<!doctype html>");
    expect(html).toContain('<template shadowrootmode="open">');
    expect(html).toContain("Assertion count decreased from 2 to 1.");
    expect(html).toContain('data-status="red"');
    expect(html).toContain('type="search"');
    expect(html).toContain('id="report-controls"');
    expect(html).toContain('href="./index.html"');
    expect(html).toContain("All reports");
    expect(html).toContain("@view-transition");
    expect(html).toContain("migration-review-sidebar-collapsed");
    expect(html).toContain("migration-review-word-wrap");
    expect(html).toContain("cubic-bezier(.23, 1, .32, 1)");
    expect(html).toContain("prefers-reduced-motion: reduce");
    expect(html).toContain("createElement");
    expect(html).not.toContain('<script>alert("branch")</script>');
    expect(html).not.toMatch(/(?:src|href)=["']https?:/);
  });
});
