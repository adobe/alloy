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

import { describe, it, expect, vi, beforeEach } from "vitest";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { applyFile } from "./apply.mjs";

// Unique prefix per spec file avoids temp-file collisions when tests run in parallel.
function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function tempFile(content) {
  const path = join(tmpdir(), `PDCL-1234-apply-spec-${uid()}.yml`);
  writeFileSync(path, content, "utf8");
  return path;
}

function xxxxFile(content) {
  const path = join(tmpdir(), `PDCL-XXXX-apply-spec-${uid()}.yml`);
  writeFileSync(path, content, "utf8");
  return path;
}

function mockApi(overrides = {}) {
  return {
    dryRun: false,
    request: vi.fn(async (method) =>
      method === "POST" ? { key: "PDCL-9999" } : {},
    ),
    searchIssues: vi.fn(async () => []),
    getRemoteLinks: vi.fn(async () => []),
    ...overrides,
  };
}

describe("applyFile — existing ticket", () => {
  it("returns the ticket key from the filename", async () => {
    const file = tempFile(`
updates:
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update:
        summary:
          - set: "New title"
`);
    const api = mockApi();
    const key = await applyFile(file, { api });
    expect(key).toBe("PDCL-1234");
    unlinkSync(file);
  });

  it("calls JIRA with interpolated PR URL and title", async () => {
    const file = tempFile(`
updates:
  - path: /rest/api/2/issue/PDCL-1234/remotelink
    method: POST
    body:
      globalId: abc-123
      object:
        url: "{GITHUB_PR_URL}"
        title: "{GITHUB_PR_TITLE}"
`);
    const api = mockApi();
    await applyFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/99",
      prTitle: "My PR",
    });
    expect(api.request).toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue/PDCL-1234/remotelink",
      expect.objectContaining({
        object: expect.objectContaining({
          url: "https://github.com/adobe/alloy/pull/99",
          title: "My PR",
        }),
      }),
    );
    unlinkSync(file);
  });

  it("returns key immediately when there are no updates", async () => {
    const file = tempFile(`details:\n  key: PDCL-1234\n`);
    const api = mockApi();
    const key = await applyFile(file, { api });
    expect(key).toBe("PDCL-1234");
    expect(api.request).not.toHaveBeenCalled();
    unlinkSync(file);
  });
});

describe("applyFile — new ticket (XXXX)", () => {
  it("creates ticket and returns real key when no existing ticket found", async () => {
    const file = xxxxFile(`
updates:
  - path: /rest/api/2/issue
    method: POST
    body:
      fields:
        project: { key: PDCL }
        summary: New feature
  - path: /rest/api/2/issue/{key}/remotelink
    method: POST
    body:
      globalId: unique-abc-123
      object:
        url: "{GITHUB_PR_URL}"
`);
    const api = mockApi();
    const key = await applyFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/1",
    });
    expect(key).toBe("PDCL-9999");
    // Create call executed
    expect(api.request).toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue",
      expect.any(Object),
    );
    // Remotelink call executed with resolved key
    expect(api.request).toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue/PDCL-9999/remotelink",
      expect.any(Object),
    );
    unlinkSync(file);
  });

  it("finds existing ticket via globalId and updates it instead of creating", async () => {
    const file = xxxxFile(`
updates:
  - path: /rest/api/2/issue
    method: POST
    body:
      fields:
        project: { key: PDCL }
        summary: New feature
  - path: /rest/api/2/issue/{key}/remotelink
    method: POST
    body:
      globalId: existing-global-id
      object:
        url: "{GITHUB_PR_URL}"
`);
    const api = mockApi({
      searchIssues: vi.fn(async () => [{ key: "PDCL-5678" }]),
      getRemoteLinks: vi.fn(async () => [{ globalId: "existing-global-id" }]),
    });
    const key = await applyFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/1",
    });
    expect(key).toBe("PDCL-5678");
    // Should NOT have called create
    expect(api.request).not.toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue",
      expect.any(Object),
    );
    // Should have updated the existing ticket with create fields
    expect(api.request).toHaveBeenCalledWith(
      "PUT",
      "/rest/api/2/issue/PDCL-5678",
      expect.objectContaining({ fields: expect.any(Object) }),
    );
    unlinkSync(file);
  });

  it("throws when XXXX file has no create entry", async () => {
    const file = xxxxFile(`
updates:
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update: {}
`);
    const api = mockApi();
    await expect(applyFile(file, { api })).rejects.toThrow(
      "XXXX file has no POST /rest/api/2/issue entry",
    );
    unlinkSync(file);
  });
});
