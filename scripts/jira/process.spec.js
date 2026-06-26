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
import { writeFileSync, existsSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { processFile } from "./process.js";

function mockApi(overrides = {}) {
  return {
    dryRun: false,
    request: vi.fn(async (method) =>
      method === "POST"
        ? { key: "PDCL-9999" }
        : { key: "PDCL-1234", fields: { summary: "Test" } },
    ),
    searchIssues: vi.fn(async () => []),
    getRemoteLinks: vi.fn(async () => []),
    ...overrides,
  };
}

// jiraKey must be at the start of the basename for the filename regex to match.
// Unique suffix per spec file prevents collisions when tests run in parallel.
function writeTemp(jiraKey, content) {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const path = join(tmpdir(), `${jiraKey}-proc-spec-${uid}.yml`);
  writeFileSync(path, content, "utf8");
  return path;
}

describe("processFile", () => {
  it("returns null and skips when file has no updates", async () => {
    const file = writeTemp("PDCL-1234", `details:\n  key: PDCL-1234\n`);
    const api = mockApi();
    const result = await processFile(file, { api });
    expect(result).toBeNull();
    expect(api.request).not.toHaveBeenCalled();
    unlinkSync(file);
  });

  it("returns null when file does not exist", async () => {
    const api = mockApi();
    const result = await processFile("/tmp/PDCL-1234-nonexistent.yml", { api });
    expect(result).toBeNull();
  });

  it("applies updates and returns ticket key for existing ticket", async () => {
    const file = writeTemp(
      "PDCL-1234",
      `
updates:
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update:
        summary:
          - set: "Updated"
`,
    );
    const api = mockApi();
    const result = await processFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/1",
      prTitle: "PR",
    });
    expect(result).toBe("PDCL-1234");
    expect(api.request).toHaveBeenCalled();
    expect(api.request).toHaveBeenCalledWith(
      "GET",
      expect.stringContaining("PDCL-1234"),
    );
    if (existsSync(file)) unlinkSync(file);
  });

  it("deletes XXXX file and creates real-key file", async () => {
    const uid = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const xxxxPath = join(tmpdir(), `PDCL-XXXX-proc-spec-${uid}.yml`);
    writeFileSync(
      xxxxPath,
      `
updates:
  - path: /rest/api/2/issue
    method: POST
    body:
      fields:
        project: { key: PDCL }
        summary: New feat
  - path: /rest/api/2/issue/{key}/remotelink
    method: POST
    body:
      globalId: abc-xyz
      object:
        url: "{GITHUB_PR_URL}"
`,
      "utf8",
    );

    const api = mockApi();
    const result = await processFile(xxxxPath, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/2",
      prTitle: "PR",
    });

    expect(result).toBe("PDCL-9999");
    expect(existsSync(xxxxPath)).toBe(false);
    const realPath = xxxxPath.replace("XXXX", "9999");
    expect(existsSync(realPath)).toBe(true);
    if (existsSync(realPath)) unlinkSync(realPath);
  });
});
