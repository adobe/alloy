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

import path from "path";
import { fileURLToPath } from "url";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const monorepoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const stageDir = path.join(monorepoRoot, "mock-extension-stage");
const vendorDir = path.join(stageDir, "vendor");
const packageDirs = {
  core: path.join(monorepoRoot, "packages/core"),
  browser: path.join(monorepoRoot, "packages/browser"),
};
const fs = {
  mkdirSync: vi.fn(),
  mkdtempSync: vi.fn(() => stageDir),
  readFileSync: vi.fn(),
  existsSync: vi.fn(),
  writeFileSync: vi.fn(),
  rmSync: vi.fn(),
};
const spawnSync = vi.fn();
const withBuildLock = vi.fn((fn) => fn());
let createExtensionPackage;

describe("createExtensionPackage() vendored workspace packages", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.doMock("child_process", () => ({ spawnSync }));
    vi.doMock("fs", () => ({ default: fs }));
    vi.doMock("archiver", () => ({ default: vi.fn() }));
    vi.doMock("../../../scripts/helpers/withBuildLock.js", () => ({
      default: withBuildLock,
    }));
    vi.spyOn(console, "log").mockImplementation(() => {});

    fs.readFileSync.mockImplementation((filename) => {
      if (filename === path.join(packageDirs.core, "package.json")) {
        return JSON.stringify({
          version: "1.0.0",
          scripts: { build: "build" },
        });
      }
      if (filename === path.join(packageDirs.browser, "package.json")) {
        return JSON.stringify({
          version: "1.0.0",
          scripts: { build: "build" },
        });
      }
      if (
        filename ===
        path.join(monorepoRoot, "packages/reactor-extension/package.json")
      ) {
        return JSON.stringify({
          dependencies: { "@adobe/alloy": "workspace:^" },
        });
      }
      throw new Error(`Unexpected file read: ${filename}`);
    });
    // Stop after vendoring so the regression never installs or builds the extension.
    spawnSync.mockImplementation((command) =>
      command === "npm"
        ? { status: 1, stderr: "Stopped before npm install" }
        : { status: 0 },
    );

    ({ createExtensionPackage } = await import("./createExtensionPackage.mjs"));
  });

  afterEach(() => {
    vi.doUnmock("child_process");
    vi.doUnmock("fs");
    vi.doUnmock("archiver");
    vi.doUnmock("../../../scripts/helpers/withBuildLock.js");
    vi.resetModules();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test.each([
    { name: "neither package is built", built: [] },
    { name: "core is already built", built: ["core"] },
    { name: "browser is already built", built: ["browser"] },
    { name: "both packages are already built", built: ["core", "browser"] },
  ])(
    "builds only missing dist directories and packs core before browser when $name",
    async ({ built }) => {
      const existingDistDirs = new Set(
        built.map((pkg) => path.join(packageDirs[pkg], "dist")),
      );
      fs.existsSync.mockImplementation(
        (filename) =>
          existingDistDirs.has(filename) || filename.endsWith(".tgz"),
      );

      await expect(createExtensionPackage()).rejects.toThrow(
        "Stopped before npm install",
      );

      const expectedCalls = [];
      for (const pkg of ["core", "browser"]) {
        const options = { cwd: packageDirs[pkg] };
        if (!built.includes(pkg)) {
          expectedCalls.push([
            "pnpm",
            ["run", "--if-present", "build"],
            options,
          ]);
        }
        expectedCalls.push([
          "pnpm",
          [
            "pack",
            "--config.ignore-scripts=true",
            "--pack-destination",
            vendorDir,
          ],
          options,
        ]);
      }
      expectedCalls.push(["npm", ["i"], { cwd: stageDir }]);
      expect(spawnSync.mock.calls).toEqual(expectedCalls);
      expect(withBuildLock).toHaveBeenCalledOnce();
      expect(fs.rmSync).toHaveBeenCalledWith(stageDir, {
        recursive: true,
        force: true,
      });
    },
  );
});
