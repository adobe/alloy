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
 * Unified vitest runner. Usage:
 *   pnpm run test                    # all unit + integration (core + extension), then test:scripts
 *   pnpm run test -- --coverage      # all with coverage
 *   pnpm run test -- --watch --mode=unit --package=extension
 *   pnpm run test -- --debug --mode=integration --package=core
 * Flags: --coverage, --watch, --debug, --mode=unit|integration, --package=core|extension|all
 * (With --mode=integration, --package=core runs browser integration; core has no integration tests.)
 * Extra args are passed to vitest (e.g. path to a test file).
 */

import { spawnSync } from "child_process";

const argv = process.argv.slice(2);

const has = (flag) => argv.includes(flag);
const get = (prefix) => {
  const arg = argv.find((a) => a.startsWith(`${prefix}=`));
  return arg ? arg.slice(prefix.length + 1) : null;
};

const coverage = has("--coverage");
const watch = has("--watch");
const debug = has("--debug");
const mode = get("--mode"); // unit | integration
const pkg = get("--package"); // core | extension | all

// Any remaining args (e.g. file path) pass through to vitest
const passthrough = argv.filter(
  (a) =>
    !a.startsWith("--mode=") &&
    !a.startsWith("--package=") &&
    a !== "--coverage" &&
    a !== "--watch" &&
    a !== "--debug",
);

const PROJECTS = {
  unit: {
    // "core" = main packages (alloy + browser), not the extension
    all: ["core/unit", "browser/unit", "reactor-extension/unit"],
    core: ["core/unit", "browser/unit"],
    extension: ["reactor-extension/unit"],
  },
  integration: {
    all: ["browser/integration", "reactor-extension/integration"],
    core: ["browser/integration"],
    extension: ["reactor-extension/integration"],
  },
};

const getProjects = () => {
  if (!mode) {
    return [
      "core/unit",
      "browser/unit",
      "browser/integration",
      "reactor-extension/unit",
      "reactor-extension/integration",
    ];
  }
  const projects = PROJECTS[mode];
  if (!projects) {
    console.error(`Invalid --mode=${mode}; use unit or integration`);
    process.exit(1);
  }
  if (!pkg || pkg === "all") {
    return projects.all;
  }
  if (pkg === "core") {
    return projects.core;
  }
  if (pkg === "extension") {
    return projects.extension;
  }
  console.error(
    `Invalid --package=${pkg}; use core, extension, or all (default)`,
  );
  process.exit(1);
};

const run = (cmd, args, opts = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: true,
    ...opts,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
  return result;
};

// Playwright install (needed for browser projects)
run("pnpm", ["exec", "playwright", "install", "chromium"]);

if (coverage) {
  run("pnpm", ["exec", "rimraf", "coverage"]);
}

const projects = getProjects();
const vitestArgs = [
  ...(watch ? [] : ["run"]),
  "--config",
  "./vitest.config.js",
  ...projects.flatMap((p) => ["--project", p]),
  ...(coverage ? ["--coverage"] : []),
  ...(debug
    ? [
        "--no-file-parallelism",
        "--browser=chromium",
        "--browser.provider=playwright",
        "--browser.headless=false",
      ]
    : []),
  ...passthrough,
];

run("pnpm", ["exec", "vitest", ...vitestArgs]);

// Default (no mode): also run script specs
if (!mode) {
  run("pnpm", ["run", "test:scripts"]);
}
