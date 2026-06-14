#!/usr/bin/env node

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

/**
 * Creates GitHub releases for packages published by `changeset publish`.
 *
 * Reads git tags pointing at HEAD (created by `changeset publish`),
 * looks up each released package's directory via `pnpm ls`, extracts the
 * matching section from its CHANGELOG.md, and creates a GitHub release
 * with `gh`.
 *
 * Usage:
 *   node scripts/createGithubReleases.js
 *   node scripts/createGithubReleases.js --dry-run
 *
 * Requires:
 *   - GH_TOKEN env var (for `gh release create`)
 *   - `pnpm`, `gh`, and `git` CLIs on PATH
 *   - Git tags already created (`changeset publish` + `git push --tags`)
 *
 * Behavior:
 *   - Skips packages with missing tags, missing changelog entries, or
 *     existing GitHub releases (idempotent — safe to re-run)
 *   - Detects prereleases from the version string (e.g. 2.31.2-beta.0)
 *   - Exits 0 when there's nothing to release
 */

// @ts-check

import { execFileSync, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { parseArgs } from "node:util";

/**
 * Parse a git tag of the form `name@version`. Splits on the LAST `@` so
 * scoped packages (`@adobe/alloy@2.34.0`) parse correctly.
 * @param {string} tag
 * @returns {{ name: string, newVersion: string } | null}
 */
export const parseTag = (tag) => {
  const lastAt = tag.lastIndexOf("@");
  if (lastAt <= 0) return null;
  const name = tag.substring(0, lastAt);
  const newVersion = tag.substring(lastAt + 1);
  if (!name || !newVersion) return null;
  return { name, newVersion };
};

/**
 * Parse a list of git tags into release entries, dropping tags that are
 * not `name@version` shaped.
 * @param {string[]} tags
 * @returns {Array<{ name: string, newVersion: string }>}
 */
export const parseTagsAtHead = (tags) =>
  tags.map(parseTag).filter((x) => x !== null);

/**
 * Returns all git tags pointing at HEAD, parsed into release entries.
 * @returns {Array<{ name: string, newVersion: string }>}
 */
export const getTagsAtHead = () => {
  const output = execSync("git tag --points-at HEAD", { encoding: "utf8" });
  const tags = output
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return parseTagsAtHead(tags);
};

/**
 * Extract the changelog section for a specific version.
 * @param {string} content
 * @param {string} version
 * @returns {string | null}
 */
export const extractChangelogEntry = (content, version) => {
  const lines = content.split("\n");
  let capturing = false;
  const captured = [];

  for (const line of lines) {
    if (line === `## ${version}`) {
      capturing = true;
      continue;
    }
    if (capturing && line.startsWith("## ")) {
      break;
    }
    if (capturing) {
      captured.push(line);
    }
  }

  const body = captured.join("\n").trim();
  return body.length > 0 ? body : null;
};

/**
 * @typedef {object} CreateGithubReleasesDeps
 * @property {() => Map<string, string>} getWorkspacePackages  Returns name → dir path.
 * @property {(tag: string) => boolean}  gitTagExists
 * @property {(tag: string) => boolean}  ghReleaseExists
 * @property {(path: string) => string | null} readFile
 * @property {(tag: string, notes: string, isPrerelease: boolean) => void} ghReleaseCreate
 * @property {(...args: unknown[]) => void} log
 * @property {(...args: unknown[]) => void} warn
 */

/**
 * Create GitHub releases for each released public package.
 * @param {CreateGithubReleasesDeps} deps
 * @param {{ releases?: Array<{ name: string, newVersion: string }> }} statusJson
 * @param {{ dryRun?: boolean }} [options]
 * @returns {{ created: number, skipped: number }}
 */
export const createGithubReleases = (deps, statusJson, options = {}) => {
  const { dryRun = false } = options;
  const {
    getWorkspacePackages,
    gitTagExists,
    ghReleaseExists,
    readFile,
    ghReleaseCreate,
    log,
    warn,
  } = deps;

  const releases = statusJson.releases || [];

  if (releases.length === 0) {
    log("No releases in changeset status; nothing to release.");
    return { created: 0, skipped: 0 };
  }

  const workspacePackages = getWorkspacePackages();

  let created = 0;
  let skipped = 0;

  for (const release of releases) {
    const { name, newVersion } = release;
    const tag = `${name}@${newVersion}`;
    const pkgDir = workspacePackages.get(name);

    if (!pkgDir) {
      log(`${tag}: not a workspace package, skipping.`);
      skipped += 1;
      continue;
    }

    if (!gitTagExists(tag)) {
      log(`${tag}: git tag not found, skipping.`);
      skipped += 1;
      continue;
    }

    if (ghReleaseExists(tag)) {
      log(`${tag}: GitHub release already exists, skipping.`);
      skipped += 1;
      continue;
    }

    const changelogPath = path.join(pkgDir, "CHANGELOG.md");
    const changelogContent = readFile(changelogPath);
    const notes = changelogContent
      ? extractChangelogEntry(changelogContent, newVersion)
      : null;

    if (!notes) {
      warn(`${tag}: no changelog entry found in ${changelogPath}, skipping.`);
      skipped += 1;
      continue;
    }

    const isPrerelease = newVersion.includes("-");

    if (dryRun) {
      log(
        `[dry-run] Would create GitHub release: ${tag} (prerelease: ${isPrerelease})`,
      );
      continue;
    }

    log(`Creating GitHub release: ${tag} (prerelease: ${isPrerelease})`);
    ghReleaseCreate(tag, notes, isPrerelease);
    created += 1;
  }

  log(`\nDone. Created ${created} release(s), skipped ${skipped} package(s).`);

  return { created, skipped };
};

/** @returns {Map<string, string>} package name → absolute directory path */
export const getWorkspacePackages = () => {
  const output = execSync("pnpm ls -r --json --depth -1", {
    encoding: "utf8",
  });
  const packages = JSON.parse(output);
  const result = new Map();
  for (const pkg of packages) {
    if (pkg.name) {
      result.set(pkg.name, pkg.path);
    }
  }
  return result;
};

/** @param {string} tag @returns {boolean} */
export const gitTagExists = (tag) => {
  try {
    execSync(`git rev-parse "${tag}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

/** @param {string} tag @returns {boolean} */
export const ghReleaseExists = (tag) => {
  try {
    execSync(`gh release view "${tag}"`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
};

/** @param {string} filePath @returns {string | null} */
export const readFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf8");
};

/**
 * @param {string} tag
 * @param {string} notes
 * @param {boolean} isPrerelease
 */
export const ghReleaseCreate = (tag, notes, isPrerelease) => {
  const args = ["release", "create", tag, "--title", tag, "--notes", notes];
  if (isPrerelease) {
    args.push("--prerelease");
  }
  execFileSync("gh", args, { stdio: "inherit" });
};

const main = () => {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean", default: false },
    },
  });
  const dryRun = values["dry-run"];

  const releases = getTagsAtHead();
  if (releases.length === 0) {
    console.log("No release tags at HEAD; nothing to release.");
    process.exit(0);
  }

  createGithubReleases(
    {
      getWorkspacePackages,
      gitTagExists,
      ghReleaseExists,
      readFile,
      ghReleaseCreate,
      log: console.log,
      warn: console.warn,
    },
    { releases },
    { dryRun },
  );
};

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main();
}
