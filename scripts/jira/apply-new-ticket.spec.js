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
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { applyFile } from "./apply.js";

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// New ticket file: PDCL-{globalId}-...yml
const globalIdFile = (globalId, content) => {
  const path = join(tmpdir(), `PDCL-${globalId}-apply-new-${uid()}.yml`);
  writeFileSync(path, content, "utf8");
  return path;
};

const mockApi = (overrides = {}) => ({
  dryRun: false,
  request: vi.fn(async (method) =>
    method === "POST" ? { key: "PDCL-9999" } : {},
  ),
  searchIssues: vi.fn(async () => []),
  ...overrides,
});

describe("applyFile — new ticket (globalId in filename)", () => {
  it("creates ticket and returns real key when no existing ticket found", async () => {
    const gid = "abc12345";
    const file = globalIdFile(
      gid,
      `
updates:
  - path: /rest/api/2/issue
    method: POST
    body:
      fields:
        project: { key: PDCL }
        summary: New feature
        labels:
          - ${gid}
`,
    );
    const api = mockApi();
    const key = await applyFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/1",
      prTitle: "My PR",
    });
    expect(key).toBe("PDCL-9999");
    expect(api.request).toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue",
      expect.any(Object),
    );
    expect(api.request).toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue/PDCL-9999/remotelink",
      expect.objectContaining({
        globalId: "https://github.com/adobe/alloy/pull/1",
      }),
    );
    unlinkSync(file);
  });

  it("finds existing ticket via label and skips create", async () => {
    const gid = "existing99";
    const file = globalIdFile(
      gid,
      `
updates:
  - path: /rest/api/2/issue
    method: POST
    body:
      fields:
        project: { key: PDCL }
        summary: New feature
        labels:
          - ${gid}
  - path: /rest/api/2/issue/{key}
    method: PUT
    body:
      update:
        summary:
          - set: "Updated"
`,
    );
    const api = mockApi({
      searchIssues: vi.fn(async () => [{ key: "PDCL-5678" }]),
    });
    const key = await applyFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/1",
      prTitle: "My PR",
    });
    expect(key).toBe("PDCL-5678");
    expect(api.request).not.toHaveBeenCalledWith(
      "POST",
      "/rest/api/2/issue",
      expect.any(Object),
    );
    expect(api.request).toHaveBeenCalledWith(
      "PUT",
      "/rest/api/2/issue/PDCL-5678",
      expect.any(Object),
    );
    unlinkSync(file);
  });

  it("skips non-create updates when no ticket key available", async () => {
    const gid = "noop1234";
    const file = globalIdFile(
      gid,
      `
updates:
  - path: /rest/api/2/issue/{key}
    method: PUT
    body:
      update:
        summary:
          - set: "Should not run"
`,
    );
    const api = mockApi();
    await applyFile(file, { api });
    expect(api.request).not.toHaveBeenCalledWith(
      "PUT",
      expect.any(String),
      expect.any(Object),
    );
    unlinkSync(file);
  });
});
