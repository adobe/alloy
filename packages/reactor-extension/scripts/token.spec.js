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

import { execFileSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
import { expect, test } from "vitest";

test("prints the org ID and cached IMS token", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "extension-token-test-"));
  try {
    fs.writeFileSync(
      path.join(cwd, ".token-cache.json"),
      JSON.stringify({
        access_token: "cached-test-token",
        expiry: Date.now() + 60_000,
      }),
    );
    const output = execFileSync(
      process.execPath,
      [fileURLToPath(new URL("./token.mjs", import.meta.url))],
      {
        cwd,
        encoding: "utf8",
        env: {
          ...process.env,
          EDGE_E2E_CLIENT_SECRET: "test-secret",
          EDGE_E2E_ORG_ID: "test-org",
        },
      },
    );
    expect(output).toContain("test-org");
    expect(output).toContain("cached-test-token");
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true });
  }
});
