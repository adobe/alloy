/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, vi } from "vitest";
import { writeFileSync, readFileSync, unlinkSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { load as yamlLoad } from "js-yaml";
import { fetchFile } from "./fetch.js";

function mockApi(issueData = {}) {
  return {
    dryRun: false,
    request: vi.fn(async () => ({
      key: "PDCL-1234",
      fields: {
        summary: "My feature",
        status: { name: "In Progress" },
        assignee: null,
        description: null,
        components: [],
        ...issueData,
      },
    })),
    searchIssues: vi.fn(async () => []),
    getRemoteLinks: vi.fn(async () => []),
  };
}

// Unique prefix per spec file avoids temp-file collisions when tests run in parallel.
function tempPath(label) {
  return join(
    tmpdir(),
    `fetch-spec-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}.yml`,
  );
}

describe("fetchFile", () => {
  it("writes details section to a new file", async () => {
    const filename = tempPath("pdcl-1234");
    const api = mockApi({ summary: "Hello world" });

    await fetchFile("PDCL-1234", filename, { api });

    const content = readFileSync(filename, "utf8");
    const parsed = yamlLoad(content.replace(/^#.*\n/, ""));
    expect(parsed.details.key).toBe("PDCL-1234");
    expect(parsed.details.summary).toBe("Hello world");
    expect(parsed.details.assignee).toBeUndefined();
    expect(parsed.details.components).toBeUndefined();
    unlinkSync(filename);
  });

  it("omits null and empty-array fields from details", async () => {
    const filename = tempPath("pdcl-1234");
    const api = mockApi({ description: null, components: [] });

    await fetchFile("PDCL-1234", filename, { api });

    const content = readFileSync(filename, "utf8");
    const parsed = yamlLoad(content.replace(/^#.*\n/, ""));
    expect(parsed.details.description).toBeUndefined();
    expect(parsed.details.components).toBeUndefined();
    unlinkSync(filename);
  });

  it("truncates long string fields to 500 chars", async () => {
    const filename = tempPath("pdcl-1234");
    const longDesc = "x".repeat(600);
    const api = mockApi({ description: longDesc });

    await fetchFile("PDCL-1234", filename, { api });

    const content = readFileSync(filename, "utf8");
    const parsed = yamlLoad(content.replace(/^#.*\n/, ""));
    expect(parsed.details.description).toHaveLength(503); // 500 + "..."
    expect(parsed.details.description.endsWith("...")).toBe(true);
    unlinkSync(filename);
  });

  it("overwrites existing file with only details, no updates", async () => {
    const filename = tempPath("pdcl-1234");
    writeFileSync(
      filename,
      `updates:\n  - path: /rest/api/2/issue/PDCL-1234\n    method: PUT\n    body: {}\n`,
      "utf8",
    );
    const api = mockApi({ summary: "Updated" });

    await fetchFile("PDCL-1234", filename, { api });

    const content = readFileSync(filename, "utf8");
    const parsed = yamlLoad(content.replace(/^#.*\n/, ""));
    expect(parsed.details.summary).toBe("Updated");
    expect(parsed.updates).toBeUndefined();
    unlinkSync(filename);
  });

  it("includes a fetched-from-JIRA comment on the first line", async () => {
    const filename = tempPath("pdcl-1234");
    const api = mockApi();

    await fetchFile("PDCL-1234", filename, { api });

    const content = readFileSync(filename, "utf8");
    expect(content.startsWith("# fetched from JIRA ")).toBe(true);
    unlinkSync(filename);
  });

  it("fetches from JIRA but outputs to stdout instead of writing in dry-run mode", async () => {
    const filename = tempPath("pdcl-1234");
    const api = { ...mockApi(), dryRun: true };

    await fetchFile("PDCL-1234", filename, { api });

    expect(existsSync(filename)).toBe(false);
    expect(api.request).toHaveBeenCalledWith(
      "GET",
      expect.stringContaining("PDCL-1234"),
    );
  });
});
