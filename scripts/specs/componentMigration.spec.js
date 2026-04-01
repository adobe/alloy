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

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { describe, it, expect } from "vitest";
import { fileURLToPath } from "url";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dirname, "../..");
const coreSrc = path.join(root, "packages/core/src");
const browserSrc = path.join(root, "packages/browser/src");

describe("ActivityCollector migration: core → browser", () => {
  it("ActivityCollector source exists in packages/browser/src/components/ActivityCollector/", () => {
    const dir = path.join(browserSrc, "components/ActivityCollector");
    expect(fs.existsSync(dir)).toBe(true);
    expect(fs.existsSync(path.join(dir, "index.js"))).toBe(true);
  });

  it("ActivityCollector source does NOT exist in packages/core/src/components/ActivityCollector/", () => {
    const dir = path.join(coreSrc, "components/ActivityCollector");
    expect(fs.existsSync(dir)).toBe(false);
  });

  it("packages/browser/src/components/componentCreators.js exports activityCollector", () => {
    const filePath = path.join(browserSrc, "components/componentCreators.js");
    const code = fs.readFileSync(filePath, "utf8");
    expect(code).toMatch(/export\s+\{\s*default\s+as\s+activityCollector\s*\}/);
  });

  it("packages/core/src/core/componentCreators.js does NOT export activityCollector", () => {
    const filePath = path.join(coreSrc, "core/componentCreators.js");
    const code = fs.readFileSync(filePath, "utf8");
    expect(code).not.toMatch(/activityCollector/);
  });

  it("combined component metadata includes activityCollector in optionalComponentNames", () => {
    const metadataPath = path.join(
      root,
      "packages/browser/scripts/helpers/componentMetadata.js",
    );
    const code = fs.readFileSync(metadataPath, "utf8");
    // componentMetadata combines core + browser optional names
    expect(code).toMatch(/coreOptional/);
    expect(code).toMatch(/browserOptional/);
    // browser componentCreators.js exports activityCollector
    const creatorsPath = path.join(
      browserSrc,
      "components/componentCreators.js",
    );
    const creatorsCode = fs.readFileSync(creatorsPath, "utf8");
    expect(creatorsCode).toMatch(/activityCollector/);
  });

  it("packages/browser/src/standalone.js imports from ./allOptionalComponents.js", () => {
    const filePath = path.join(browserSrc, "standalone.js");
    const code = fs.readFileSync(filePath, "utf8");
    expect(code).toMatch(/from\s+["']\.\/allOptionalComponents\.js["']/);
  });

  it("custom build succeeds and bundle contains ActivityCollector", () => {
    const outDir = path.join(root, "scripts/specs/.tmp-build");
    fs.mkdirSync(outDir, { recursive: true });
    try {
      execSync(
        `node packages/browser/scripts/alloyBuilder.js build --no-minify -o ${outDir}`,
        { cwd: root, stdio: "pipe" },
      );
      const bundle = fs.readFileSync(path.join(outDir, "alloy.js"), "utf8");
      expect(bundle).toContain("ActivityCollector");
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  }, 20000);

  it("custom build with --exclude activityCollector does NOT contain ActivityCollector", () => {
    const outDir = path.join(root, "scripts/specs/.tmp-build-exclude");
    fs.mkdirSync(outDir, { recursive: true });
    try {
      execSync(
        `node packages/browser/scripts/alloyBuilder.js build --exclude activityCollector --no-minify -o ${outDir}`,
        { cwd: root, stdio: "pipe" },
      );
      const bundle = fs.readFileSync(path.join(outDir, "alloy.js"), "utf8");
      expect(bundle).not.toContain("ActivityCollector");
    } finally {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  }, 20000);
});
