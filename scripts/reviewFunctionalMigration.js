#!/usr/bin/env node

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
import {
  renderMarkdown,
  reviewMigration,
} from "./functionalMigrationReview/reviewFunctionalMigration.js";
import { renderHtml } from "./functionalMigrationReview/renderHtml.js";

const usage = `Usage:
  pnpm review:functional-migration --base <ref> --branch <ref> --category <name> [options]

Options:
  --id <C123>                 Show one case with detailed evidence
  --functional-path <path>   Override the functional spec directory
  --integration-path <path>  Override the integration spec directory
  --format <html|markdown|json> Output format (default: markdown)
  --output <path>             Write output to a file
  --help                      Show this help
`;

const parseArguments = (args) => {
  const options = {};
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index]?.replace(/^--/, "");
    if (name === "help") {
      options.help = true;
      index -= 1;
      continue;
    }
    const value = args[index + 1];
    if (!name || !value) {
      throw new Error(`Expected a value after ${args[index] ?? "argument"}.`);
    }
    options[name] = value;
  }
  return options;
};

const main = async () => {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage);
    return;
  }
  const required = ["base", "branch", "category"];
  const missing = required.filter((name) => !options[name]);
  if (missing.length) {
    throw new Error(
      `Missing required options: ${missing.map((name) => `--${name}`).join(", ")}`,
    );
  }

  const completeReview = reviewMigration({
    baseRef: options.base,
    branchRef: options.branch,
    functionalPath:
      options["functional-path"] ??
      `packages/browser/test/functional/specs/${options.category}`,
    integrationPath:
      options["integration-path"] ??
      `packages/browser/test/integration/specs/${options.category}`,
  });
  const review = options.id
    ? {
        ...completeReview,
        comparisons: completeReview.comparisons.filter(
          ({ id }) => id === options.id.toUpperCase(),
        ),
      }
    : completeReview;
  if (options.id && review.comparisons.length === 0) {
    throw new Error(`Case ${options.id} was not found.`);
  }
  const output =
    options.format === "html"
      ? await renderHtml(review)
      : options.format === "json"
        ? `${JSON.stringify(review, null, 2)}\n`
        : renderMarkdown(review, { includeEvidence: Boolean(options.id) });

  if (options.output) {
    fs.writeFileSync(options.output, output);
    console.log(options.output);
  } else {
    process.stdout.write(output);
  }
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
