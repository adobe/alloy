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

import fs from "fs";
import path from "path";
import { describe, it, expect, vi } from "vitest";
import {
  extractChangelogEntry,
  getPublicPackages,
  gitTagExists,
  createGithubReleases,
} from "./createGithubReleases.js";

describe("getPublicPackages", () => {
  it("returns a Map containing @adobe/alloy and @adobe/alloy-core", () => {
    const result = getPublicPackages();

    expect(result).toBeInstanceOf(Map);
    expect(result.has("@adobe/alloy")).toBe(true);
    expect(result.has("@adobe/alloy-core")).toBe(true);
  });

  it("does not include private packages", () => {
    const result = getPublicPackages();

    for (const name of result.keys()) {
      expect(name).not.toContain("sandbox");
      expect(name).not.toBe("adobe-alloy-monorepo");
    }
  });

  it("maps to directories that contain a package.json", () => {
    const result = getPublicPackages();

    for (const dir of result.values()) {
      expect(fs.existsSync(path.join(dir, "package.json"))).toBe(true);
    }
  });
});

describe("gitTagExists", () => {
  it("returns true for a tag that exists", () => {
    // HEAD always resolves
    expect(gitTagExists("HEAD")).toBe(true);
  });

  it("returns false for a tag that does not exist", () => {
    expect(gitTagExists("@adobe/alloy@0.0.0-does-not-exist")).toBe(false);
  });
});

describe("extractChangelogEntry", () => {
  const changelog = `# @adobe/alloy

## 2.22.0

### Minor Changes

- Added streaming support

### Patch Changes

- Fixed a typo

## 2.21.0

### Minor Changes

- Added new feature
`;

  it("extracts the section for the given version", () => {
    const result = extractChangelogEntry(changelog, "2.22.0");
    expect(result).toContain("Added streaming support");
    expect(result).toContain("Fixed a typo");
  });

  it("returns null when the version is not present", () => {
    expect(extractChangelogEntry(changelog, "9.9.9")).toBeNull();
  });

  it("returns null for an empty section", () => {
    const content = "## 1.0.0\n## 0.9.0\n\nOlder stuff\n";
    expect(extractChangelogEntry(content, "1.0.0")).toBeNull();
  });

  it("extracts the last section (no trailing ##)", () => {
    const result = extractChangelogEntry(changelog, "2.21.0");
    expect(result).toContain("Added new feature");
  });
});

describe("createGithubReleases", () => {
  const CHANGELOG = `# Changelog\n\n## 2.22.0\n\n- Added streaming support\n\n## 2.21.0\n\n- Old\n`;

  const makeDeps = (overrides = {}) => ({
    getPublicPackages: () =>
      new Map([
        ["@adobe/alloy", "/packages/alloy"],
        ["@adobe/alloy-core", "/packages/core"],
      ]),
    gitTagExists: () => true,
    ghReleaseExists: () => false,
    readFile: () => CHANGELOG,
    ghReleaseCreate: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    ...overrides,
  });

  it("creates a release for a public package with a valid changelog", () => {
    const deps = makeDeps();
    const result = createGithubReleases(deps, {
      releases: [{ name: "@adobe/alloy", newVersion: "2.22.0" }],
    });

    expect(result).toEqual({ created: 1, skipped: 0 });
    expect(deps.ghReleaseCreate).toHaveBeenCalledWith(
      "@adobe/alloy@2.22.0",
      expect.stringContaining("Added streaming support"),
      false,
    );
  });

  it("skips private packages", () => {
    const deps = makeDeps({ getPublicPackages: () => new Map() });
    const result = createGithubReleases(deps, {
      releases: [{ name: "@adobe/private-pkg", newVersion: "1.0.0" }],
    });

    expect(result).toEqual({ created: 0, skipped: 1 });
    expect(deps.ghReleaseCreate).not.toHaveBeenCalled();
  });

  it("skips packages with no git tag", () => {
    const deps = makeDeps({ gitTagExists: () => false });
    const result = createGithubReleases(deps, {
      releases: [{ name: "@adobe/alloy", newVersion: "2.22.0" }],
    });

    expect(result).toEqual({ created: 0, skipped: 1 });
    expect(deps.ghReleaseCreate).not.toHaveBeenCalled();
  });

  it("skips packages where GitHub release already exists", () => {
    const deps = makeDeps({ ghReleaseExists: () => true });
    const result = createGithubReleases(deps, {
      releases: [{ name: "@adobe/alloy", newVersion: "2.22.0" }],
    });

    expect(result).toEqual({ created: 0, skipped: 1 });
    expect(deps.ghReleaseCreate).not.toHaveBeenCalled();
  });

  it("skips packages with no changelog entry", () => {
    const deps = makeDeps({ readFile: () => null });
    const result = createGithubReleases(deps, {
      releases: [{ name: "@adobe/alloy", newVersion: "2.22.0" }],
    });

    expect(result).toEqual({ created: 0, skipped: 1 });
    expect(deps.ghReleaseCreate).not.toHaveBeenCalled();
  });

  it("detects prerelease from version string", () => {
    const deps = makeDeps({
      readFile: () => "## 3.0.0-beta.1\n\nBeta stuff\n",
    });
    createGithubReleases(deps, {
      releases: [{ name: "@adobe/alloy", newVersion: "3.0.0-beta.1" }],
    });

    expect(deps.ghReleaseCreate).toHaveBeenCalledWith(
      "@adobe/alloy@3.0.0-beta.1",
      "Beta stuff",
      true,
    );
  });

  it("handles multiple packages with mixed outcomes", () => {
    const deps = makeDeps({
      gitTagExists: (tag) => tag.startsWith("@adobe/alloy@"),
    });
    const result = createGithubReleases(deps, {
      releases: [
        { name: "@adobe/alloy", newVersion: "2.22.0" },
        { name: "@adobe/alloy-core", newVersion: "1.5.0" },
        { name: "@adobe/private-pkg", newVersion: "0.1.0" },
      ],
    });

    expect(result).toEqual({ created: 1, skipped: 2 });
    expect(deps.ghReleaseCreate).toHaveBeenCalledOnce();
  });
});
