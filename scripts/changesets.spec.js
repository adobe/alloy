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
import http from "http";
import { execFile } from "child_process";
import { createRequire } from "module";
import { promisify } from "util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getReleaseState } from "./getReleaseState.js";

const exec = promisify(execFile);
const require = createRequire(import.meta.url);
const cli = path.join(
  path.dirname(require.resolve("@changesets/cli/package.json")),
  "bin.js",
);
const config = JSON.parse(fs.readFileSync(".changeset/config.json", "utf8"));
const names = [
  "@alloy-release-test/core",
  "@alloy-release-test/browser",
  "release-test-extension",
];

describe("Changesets release lifecycle", () => {
  let rootDir;
  let registry;
  let versions;
  let uploads;
  let rejectPackage;

  const writeJson = (file, value) => {
    fs.writeFileSync(path.join(rootDir, file), JSON.stringify(value));
  };

  const readJson = (file) =>
    JSON.parse(fs.readFileSync(path.join(rootDir, file), "utf8"));

  const run = (command, args) =>
    exec(command, args, {
      cwd: rootDir,
      timeout: 20_000,
      env: {
        PATH: [
          path.join(rootDir, "bin"),
          path.dirname(process.execPath),
          "/usr/bin",
          "/bin",
        ].join(path.delimiter),
        HOME: rootDir,
        TMPDIR: rootDir,
        GIT_CONFIG_GLOBAL: os.devNull,
        GIT_CONFIG_NOSYSTEM: "1",
        NPM_CONFIG_USERCONFIG: path.join(rootDir, ".npmrc"),
        npm_config_registry: `http://127.0.0.1:${registry.address().port}/`,
        CI: "true",
      },
    }).catch((error) => {
      error.message += `\n${error.stdout}\n${error.stderr}`;
      throw error;
    });

  const changeset = (...args) => run(process.execPath, [cli, ...args]);
  const git = (...args) => run("git", args);
  const addChangeset = (id) => {
    fs.writeFileSync(
      path.join(rootDir, ".changeset", `${id}.md`),
      `---\n"${names[0]}": patch\n---\n\nFix ${id}.\n`,
    );
  };
  const packageVersions = () =>
    ["core", "browser", "extension"].map(
      (name) => readJson(`packages/${name}/package.json`).version,
    );

  beforeEach(async () => {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "alloy-changesets-"));
    versions = new Map();
    uploads = [];
    rejectPackage = undefined;
    registry = http.createServer(async (request, response) => {
      const name = decodeURIComponent(request.url.slice(1));
      response.setHeader("Content-Type", "application/json");
      if (request.method === "GET") {
        if (!versions.has(name)) {
          response.writeHead(404);
          response.end(JSON.stringify({ error: "Not found" }));
          return;
        }
        response.end(JSON.stringify(versions.get(name)));
        return;
      }
      if (request.method === "PUT" && names.includes(name)) {
        let body = "";
        for await (const chunk of request) body += chunk;
        if (name === rejectPackage) {
          response.writeHead(403);
          response.end(JSON.stringify({ error: "Forbidden for testing" }));
          return;
        }
        const manifest = JSON.parse(body);
        const current = versions.get(name);
        versions.set(name, {
          ...manifest,
          versions: { ...current?.versions, ...manifest.versions },
          "dist-tags": { ...current?.["dist-tags"], ...manifest["dist-tags"] },
        });
        uploads.push(name);
        response.writeHead(201);
        response.end(JSON.stringify({ ok: true }));
        return;
      }
      response.writeHead(405);
      response.end(JSON.stringify({ error: "Unexpected registry request" }));
    });
    await new Promise((resolve) => registry.listen(0, "127.0.0.1", resolve));

    fs.mkdirSync(path.join(rootDir, "bin"));
    fs.symlinkSync(process.env.npm_execpath, path.join(rootDir, "bin", "pnpm"));
    fs.mkdirSync(path.join(rootDir, ".changeset"));
    writeJson("package.json", {
      name: "alloy-release-test",
      private: true,
      devEngines: {
        packageManager: { name: "pnpm", onFail: "error" },
      },
    });
    fs.writeFileSync(
      path.join(rootDir, "pnpm-workspace.yaml"),
      'packages:\n  - "packages/*"\n',
    );
    const port = registry.address().port;
    fs.writeFileSync(
      path.join(rootDir, ".npmrc"),
      `registry=http://127.0.0.1:${port}/\n//127.0.0.1:${port}/:_authToken=test-token\n`,
    );
    writeJson(".changeset/config.json", {
      ...config,
      changelog: [
        path.resolve(".changeset/changelog.mjs"),
        { repo: "adobe/alloy" },
      ],
    });
    for (const [index, directory] of [
      "core",
      "browser",
      "extension",
    ].entries()) {
      fs.mkdirSync(path.join(rootDir, "packages", directory), {
        recursive: true,
      });
      writeJson(`packages/${directory}/package.json`, {
        name: names[index],
        version: "1.0.0",
        private: index === 2,
        ...(index > 0 && {
          dependencies: { [names[index - 1]]: "workspace:^" },
        }),
      });
    }
    fs.writeFileSync(path.join(rootDir, ".gitignore"), "bin\nnode_modules\n");
    await git("init", "-b", "main");
    await git("config", "user.email", "release-test@example.com");
    await git("config", "user.name", "Release test");
    await git("add", ".");
    await git(
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "-m",
      "Initial fixture",
    );
  });

  afterEach(async () => {
    vi.unstubAllEnvs();
    registry.closeAllConnections();
    await new Promise((resolve) => registry.close(resolve));
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it("does not inherit secrets or Git overrides from the parent environment", async () => {
    vi.stubEnv("ALLOY_TEST_SECRET", "must-not-reach-child");
    vi.stubEnv("GIT_DIR", path.join(rootDir, "decoy.git"));
    vi.stubEnv("GIT_INDEX_FILE", path.join(rootDir, "decoy-index"));
    vi.stubEnv("GIT_WORK_TREE", path.join(rootDir, "decoy-worktree"));
    vi.stubEnv("GIT_CONFIG_GLOBAL", path.join(rootDir, "decoy-config"));
    const { stdout } = await run(process.execPath, [
      "-e",
      "process.stdout.write(JSON.stringify(process.env))",
    ]);
    const env = JSON.parse(stdout);
    expect(env.ALLOY_TEST_SECRET).toBeUndefined();
    expect(env.GIT_DIR).toBeUndefined();
    expect(env.GIT_INDEX_FILE).toBeUndefined();
    expect(env.GIT_WORK_TREE).toBeUndefined();
    expect(env.GIT_CONFIG_GLOBAL).toBe(os.devNull);
    expect(env.GIT_CONFIG_NOSYSTEM).toBe("1");
    expect(env.HOME).toBe(rootDir);
    // macOS can add this variable at startup even when the supplied environment is empty.
    const keys = Object.keys(env).filter(
      (name) => name !== "__CF_USER_TEXT_ENCODING",
    );
    expect(keys.sort()).toEqual(
      [
        "CI",
        "GIT_CONFIG_GLOBAL",
        "GIT_CONFIG_NOSYSTEM",
        "HOME",
        "NPM_CONFIG_USERCONFIG",
        "PATH",
        "TMPDIR",
        "npm_config_registry",
      ].sort(),
    );
    const result = await git("rev-parse", "--show-toplevel");
    expect(fs.realpathSync(result.stdout.trim())).toBe(
      fs.realpathSync(rootDir),
    );
  });

  it("versions two betas, promotes to stable, and tags private packages", async () => {
    await changeset("pre", "enter", "beta");
    addChangeset("first");
    await changeset("version");
    expect(packageVersions()).toEqual(Array(3).fill("1.0.1-beta.0"));
    expect(fs.existsSync(path.join(rootDir, ".changeset/pre/first.md"))).toBe(
      true,
    );
    expect(getReleaseState(rootDir).proceed).toBe(false);

    addChangeset("second");
    expect(getReleaseState(rootDir).proceed).toBe(true);
    await changeset("version");
    expect(packageVersions()).toEqual([
      "1.0.1-beta.1",
      "1.0.1-beta.0",
      "1.0.1-beta.0",
    ]);
    await changeset("pre", "exit");
    expect(getReleaseState(rootDir)).toEqual({
      proceed: true,
      environment: "Production",
    });
    await changeset("version");
    expect(packageVersions()).toEqual(Array(3).fill("1.0.1"));
    expect(fs.existsSync(path.join(rootDir, ".changeset/pre.json"))).toBe(
      false,
    );
    expect(getReleaseState(rootDir).proceed).toBe(false);

    await git("add", ".");
    await git(
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "-m",
      "Version fixture",
    );
    await changeset("git-tag");
    await changeset("git-tag");
    const { stdout } = await git("tag", "--points-at", "HEAD");
    expect(stdout.trim().split("\n").sort()).toEqual(
      names.map((name) => `${name}@1.0.1`).sort(),
    );
  }, 30_000);

  it("migrates v2 prerelease state without bumping existing versions", async () => {
    writeJson(".changeset/pre.json", {
      mode: "pre",
      tag: "beta",
      initialVersions: { [names[0]]: "1.0.0" },
      changesets: ["versioned"],
    });
    addChangeset("versioned");
    await changeset("status");
    expect(readJson(".changeset/pre.json")).toEqual({
      mode: "pre",
      tag: "beta",
    });
    expect(
      fs.existsSync(path.join(rootDir, ".changeset/pre/versioned.md")),
    ).toBe(true);
    expect(getReleaseState(rootDir).proceed).toBe(false);
    expect(packageVersions()).toEqual(Array(3).fill("1.0.0"));
  });

  it("skips versioning for publish-only recovery instead of swallowing errors", async () => {
    expect(getReleaseState(rootDir).proceed).toBe(false);
    await expect(changeset("version")).rejects.toMatchObject({ code: 1 });
  });

  it("publishes with pnpm devEngines and skips versions already in the registry", async () => {
    await changeset("publish");
    expect(uploads.sort()).toEqual(names.slice(0, 2).sort());
    expect(versions.get(names[1]).versions["1.0.0"].dependencies).toEqual({
      [names[0]]: "^1.0.0",
    });
    await changeset("publish");
    expect(uploads).toHaveLength(2);
  }, 30_000);

  it("publishes a beta without changing the stable dist tag", async () => {
    for (const name of names.slice(0, 2)) {
      versions.set(name, {
        name,
        versions: { "1.0.0": { name, version: "1.0.0" } },
        "dist-tags": { latest: "1.0.0" },
      });
    }
    await changeset("pre", "enter", "beta");
    addChangeset("beta");
    await changeset("version");
    await changeset("publish");
    for (const name of names.slice(0, 2)) {
      expect(versions.get(name)["dist-tags"]).toEqual({
        latest: "1.0.0",
        beta: "1.0.1-beta.0",
      });
    }
    expect(uploads).toHaveLength(2);
  }, 30_000);

  it("recovers a partial publish and backfills missing git tags", async () => {
    rejectPackage = names[1];
    await expect(changeset("publish")).rejects.toMatchObject({ code: 1 });
    expect(uploads).toEqual([names[0]]);
    rejectPackage = undefined;
    await changeset("publish");
    expect(uploads).toEqual(names.slice(0, 2));
    await git("tag", "-d", `${names[0]}@1.0.0`);
    await changeset("git-tag");
    const { stdout } = await git("tag", "--points-at", "HEAD");
    expect(stdout.trim().split("\n").sort()).toEqual(
      names.map((name) => `${name}@1.0.0`).sort(),
    );
  }, 30_000);
});
