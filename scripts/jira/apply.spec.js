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

const tempFile = (content) => {
  const path = join(tmpdir(), `PDCL-1234-apply-spec-${uid()}.yml`);
  writeFileSync(path, content, "utf8");
  return path;
};

const mockApi = (overrides = {}) => ({
  dryRun: false,
  request: vi.fn(async () => ({})),
  searchIssues: vi.fn(async () => []),
  ...overrides,
});

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
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update:
        summary:
          - set: "{GITHUB_PR_TITLE}"
`);
    const api = mockApi();
    await applyFile(file, {
      api,
      prUrl: "https://github.com/adobe/alloy/pull/99",
      prTitle: "My PR",
    });
    expect(api.request).toHaveBeenCalledWith(
      "PUT",
      "/rest/api/2/issue/PDCL-1234",
      expect.objectContaining({
        update: expect.objectContaining({
          summary: [{ set: "My PR" }],
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

  it("auto-creates a remote link when prUrl is provided", async () => {
    const file = tempFile(`
updates:
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update:
        summary:
          - set: "Updated"
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
        globalId: "https://github.com/adobe/alloy/pull/99",
        object: expect.objectContaining({
          url: "https://github.com/adobe/alloy/pull/99",
          title: "My PR",
        }),
      }),
    );
    unlinkSync(file);
  });

  it("skips remote link when prUrl is absent", async () => {
    const file = tempFile(`
updates:
  - path: /rest/api/2/issue/PDCL-1234
    method: PUT
    body:
      update:
        summary:
          - set: "Updated"
`);
    const api = mockApi();
    await applyFile(file, { api }); // no prUrl
    expect(api.request).not.toHaveBeenCalledWith(
      "POST",
      expect.stringContaining("remotelink"),
      expect.any(Object),
    );
    unlinkSync(file);
  });
});
