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

import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import {
  renderMarkdown,
  reviewBranch,
} from "./functionalMigrationReview/reviewFunctionalMigration.js";
import {
  clientScript,
  renderHtml,
} from "./functionalMigrationReview/renderHtml.js";

const usage = `Usage:
  pnpm review:functional-migration-stack [options]

Options:
  --base <ref>         Base ref (default: migrate-integration/00-infra)
  --output-dir <path>  Report directory (default: /tmp/alloy-functional-migration-review)
  --help               Show this help
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

const listMigrationBranches = () =>
  execFileSync("git", ["worktree", "list", "--porcelain"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter((line) => line.startsWith("branch refs/heads/"))
    .map((line) => line.replace("branch refs/heads/", ""))
    .filter(
      (branch) =>
        branch.startsWith("migrate-integration/") &&
        branch !== "migrate-integration/00-infra",
    )
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    );

const countStatuses = (review) =>
  review.comparisons.reduce(
    (counts, { status }) => ({ ...counts, [status]: counts[status] + 1 }),
    { green: 0, red: 0, yellow: 0 },
  );

const renderSummary = ({ baseRef, results }) => {
  const lines = [
    "# Functional Migration Stack Review",
    "",
    `- Base: \`${baseRef}\``,
    `- Branches: ${results.length}`,
    "",
    "| Branch | Red | Yellow | Green | Scoped Files | Other formats |",
    "| --- | ---: | ---: | ---: | ---: | --- |",
  ];
  results.forEach(
    ({ branch, counts, functionalFiles, htmlFile, jsonFile, markdownFile }) => {
      lines.push(
        `| [${branch}](./${htmlFile}) | ${counts.red} | ${counts.yellow} | ${counts.green} | ${functionalFiles} | [Markdown](./${markdownFile}) · [JSON](./${jsonFile}) |`,
      );
    },
  );
  lines.push("");
  return `${lines.join("\n")}\n`;
};

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderHtmlSummary = ({ baseRef, results }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Functional migration stack review</title>
  <style>
    @view-transition { navigation: auto; }
    :root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #202124; background: #f8f9fa; }
    * { box-sizing: border-box; }
    body { margin: 0; min-width: 320px; }
    main { max-width: 1100px; margin: 0 auto; padding: 32px 20px 64px; }
    h1 { margin: 0 0 6px; font-size: 24px; letter-spacing: 0; }
    .header { display: flex; align-items: end; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
    .header-copy { min-width: 0; }
    p { margin: 0; color: #62666d; }
    .index-search { width: min(280px, 100%); height: 38px; padding: 7px 11px; border: 1px solid #aeb4bb; border-radius: 7px; background: rgba(255, 255, 255, .88); font: inherit; }
    .index-search:focus-visible, a:focus-visible { outline: 3px solid #1967d2; outline-offset: 2px; }
    .table { overflow-x: auto; border: 1px solid #c9cdd2; border-radius: 4px; background: #fff; }
    table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
    th, td { padding: 11px 12px; border-bottom: 1px solid #d8dadd; text-align: right; }
    tr:last-child td { border-bottom: 0; }
    tr { transition: background-color 140ms ease; }
    @media (hover: hover) and (pointer: fine) { tbody tr:hover { background: #f5f7f8; } }
    th { color: #62666d; font-size: 11px; text-transform: uppercase; }
    th:first-child, td:first-child { text-align: left; }
    a { color: #0b57d0; font-weight: 600; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .red { color: #b3261e; font-weight: 700; }
    .yellow { color: #b06000; font-weight: 700; }
    .green { color: #137333; font-weight: 700; }
    ::view-transition-old(root) { animation: 120ms cubic-bezier(.23, 1, .32, 1) both report-out; }
    ::view-transition-new(root) { animation: 220ms cubic-bezier(.23, 1, .32, 1) both report-in; }
    @keyframes report-out { to { opacity: 0; transform: scale(.995); } }
    @keyframes report-in { from { opacity: 0; transform: scale(.99); } }
    @media (max-width: 680px) { .header { align-items: stretch; flex-direction: column; } .index-search { width: 100%; } }
    @media (prefers-reduced-motion: reduce) { tr { transition: none; } ::view-transition-group(*) { animation-duration: 0s; } }
  </style>
</head>
<body>
  <main>
    <header class="header">
      <div class="header-copy">
        <h1>Functional migration stack review</h1>
        <p>${results.length} branches compared with <code>${escapeHtml(
          baseRef,
        )}</code>. Open a branch for source diffs and structural evidence.</p>
      </div>
      <div id="index-controls"><input class="index-search" type="search" placeholder="Filter branches" aria-label="Filter migration branches"></div>
    </header>
    <div class="table"><table>
      <thead><tr><th>Branch</th><th>Red</th><th>Yellow</th><th>Green</th><th>Scoped files</th></tr></thead>
      <tbody>${results
        .map(
          ({ branch, counts, functionalFiles, htmlFile }) =>
            `<tr data-search="${escapeHtml(
              branch.toLowerCase(),
            )}"><td><a href="./${escapeHtml(htmlFile)}">${escapeHtml(
              branch,
            )}</a></td><td class="red">${counts.red}</td><td class="yellow">${
              counts.yellow
            }</td><td class="green">${counts.green}</td><td>${
              functionalFiles
            }</td></tr>`,
        )
        .join("")}</tbody>
    </table></div>
  </main>
  <script>${clientScript}</script>
</body>
</html>
`;

const main = async () => {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(usage);
    return;
  }

  const baseRef = options.base ?? "migrate-integration/00-infra";
  const outputDirectory =
    options["output-dir"] ?? "/tmp/alloy-functional-migration-review";
  fs.mkdirSync(outputDirectory, { recursive: true });

  const results = [];
  for (const branch of listMigrationBranches()) {
    const review = reviewBranch({ baseRef, branchRef: branch });
    const slug = branch.replace("migrate-integration/", "");
    const htmlFile = `${slug}.html`;
    const jsonFile = `${slug}.json`;
    const markdownFile = `${slug}.md`;
    fs.writeFileSync(
      path.join(outputDirectory, markdownFile),
      renderMarkdown(review, { includeEvidence: ["red", "yellow"] }),
    );
    fs.writeFileSync(
      path.join(outputDirectory, jsonFile),
      `${JSON.stringify(review, null, 2)}\n`,
    );
    // Sequential rendering caps Shiki's memory use across the full stack.
    // eslint-disable-next-line no-await-in-loop
    const html = await renderHtml(review);
    fs.writeFileSync(path.join(outputDirectory, htmlFile), html);
    const counts = countStatuses(review);
    console.log(
      `${branch}: ${counts.red} red, ${counts.yellow} yellow, ${counts.green} green`,
    );
    results.push({
      branch,
      counts,
      functionalFiles: review.functionalFiles.length,
      htmlFile,
      jsonFile,
      markdownFile,
    });
  }

  const summaryPath = path.join(outputDirectory, "README.md");
  fs.writeFileSync(summaryPath, renderSummary({ baseRef, results }));
  const indexPath = path.join(outputDirectory, "index.html");
  fs.writeFileSync(indexPath, renderHtmlSummary({ baseRef, results }));
  console.log(indexPath);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
