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

import fs from "fs";
import os from "os";
import path from "path";
import { execFileSync } from "child_process";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getReleaseState } from "./getReleaseState.js";

describe("getReleaseState", () => {
  let rootDir;
  let changesetDir;

  beforeEach(() => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "alloy-release-state-"));
    changesetDir = path.join(rootDir, ".changeset");
    fs.mkdirSync(changesetDir);
  });

  afterEach(() => {
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  const setMode = (mode) => {
    fs.writeFileSync(
      path.join(changesetDir, "pre.json"),
      JSON.stringify({ mode, tag: "beta" }),
    );
  };

  const archiveChangeset = () => {
    fs.mkdirSync(path.join(changesetDir, "pre"));
    fs.writeFileSync(path.join(changesetDir, "pre", "released.md"), "");
  };

  it("detects queued beta changesets", () => {
    setMode("pre");
    fs.writeFileSync(path.join(changesetDir, "queued.md"), "");
    expect(getReleaseState(rootDir)).toEqual({
      proceed: true,
      environment: "Beta",
    });
  });

  it("does not release archived beta changesets again", () => {
    setMode("pre");
    archiveChangeset();
    expect(getReleaseState(rootDir)).toEqual({
      proceed: false,
      environment: "Beta",
    });
  });

  it("detects new beta work alongside archived changesets", () => {
    setMode("pre");
    archiveChangeset();
    fs.writeFileSync(path.join(changesetDir, "queued.md"), "");
    expect(getReleaseState(rootDir).proceed).toBe(true);
  });

  it("promotes archived beta work without a new changeset", () => {
    setMode("exit");
    archiveChangeset();
    expect(getReleaseState(rootDir)).toEqual({
      proceed: true,
      environment: "Production",
    });
  });

  it("allows prerelease exit even without changeset files", () => {
    setMode("exit");
    expect(getReleaseState(rootDir).proceed).toBe(true);
  });

  it("detects stable changesets outside prerelease mode", () => {
    fs.writeFileSync(path.join(changesetDir, "queued.md"), "");
    expect(getReleaseState(rootDir)).toEqual({
      proceed: true,
      environment: "Production",
    });
  });

  it("allows publish-only recovery when stable versioning has finished", () => {
    expect(getReleaseState(rootDir)).toEqual({
      proceed: false,
      environment: "Production",
    });
  });

  it("ignores documentation, hidden files, and directories", () => {
    for (const name of [
      "README.md",
      "readme.md",
      "AGENTS.md",
      "CLAUDE.md",
      "GEMINI.md",
      ".hidden.md",
    ]) {
      fs.writeFileSync(path.join(changesetDir, name), "");
    }
    fs.mkdirSync(path.join(changesetDir, "directory.md"));
    expect(getReleaseState(rootDir).proceed).toBe(false);
  });

  it("rejects corrupt prerelease state instead of routing to Production", () => {
    fs.writeFileSync(path.join(changesetDir, "pre.json"), "{");
    expect(() => getReleaseState(rootDir)).toThrow();
  });

  it("rejects unknown prerelease modes", () => {
    setMode("unexpected");
    expect(() => getReleaseState(rootDir)).toThrow(
      "Unexpected prerelease mode",
    );
  });

  it("emits GitHub Actions outputs from the CLI", () => {
    setMode("pre");
    const output = execFileSync(
      process.execPath,
      [path.resolve("scripts/getReleaseState.js")],
      { cwd: rootDir, encoding: "utf8", env: {} },
    );
    expect(output).toBe("proceed=false\nenvironment=Beta\n");
  });
});
