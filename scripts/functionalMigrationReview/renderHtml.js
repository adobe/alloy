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

// The package exports this entry point, but this repo's resolver does not inspect package exports.
// eslint-disable-next-line import/no-unresolved
import { preloadMultiFileDiff } from "@pierre/diffs/ssr";
import { buildSync } from "esbuild";
import { fileURLToPath } from "url";

export const clientScript = buildSync({
  bundle: true,
  entryPoints: [fileURLToPath(new URL("./reportClient.js", import.meta.url))],
  format: "iife",
  minify: true,
  platform: "browser",
  target: ["chrome111", "firefox111", "safari16.4"],
  write: false,
}).outputFiles[0].text;

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const countStatuses = (comparisons) =>
  comparisons.reduce(
    (counts, { status }) => ({ ...counts, [status]: counts[status] + 1 }),
    { green: 0, red: 0, yellow: 0 },
  );

const activeCases = (cases) => cases.filter(({ skipped }) => !skipped);

const countEvidence = (cases, property) =>
  activeCases(cases).reduce(
    (count, testCase) => count + testCase[property].length,
    0,
  );

const caseLocations = (cases) =>
  [...new Set(cases.map(({ file, line }) => `${file}:${line}`))].join(", ") ||
  "not found";

const sourceFor = (cases) =>
  cases
    .map(
      ({ file, line, source, title }) =>
        `// ${file}:${line} | ${title}\n${source ?? ""}`,
    )
    .join("\n\n");

const renderFinding = (finding) => `<li>${escapeHtml(finding)}</li>`;

const renderEvidenceItems = (label, values) =>
  values.length
    ? `<dt>${label}</dt><dd><ul>${values
        .map(
          ({ line, text }) =>
            `<li><span class="line">${escapeHtml(
              typeof line === "number" ? `L${line}` : line,
            )}</span><code>${escapeHtml(text.replace(/\s+/g, " "))}</code></li>`,
        )
        .join("")}</ul></dd>`
    : "";

const renderTestEvidence = (testCase) => `<article class="test-evidence">
  <h4>${escapeHtml(testCase.title || "Untitled test")}</h4>
  <p><code>${escapeHtml(`${testCase.file}:${testCase.line}`)}</code>${
    testCase.skipped ? '<strong class="skipped">Skipped</strong>' : ""
  }</p>
  <dl>
    ${renderEvidenceItems("Commands", testCase.commands)}
    ${renderEvidenceItems("Assertions", testCase.assertions)}
    ${renderEvidenceItems("State", testCase.stateOperations)}
    ${renderEvidenceItems(
      "Risks",
      testCase.risks.map(({ kind, text }) => ({ line: kind, text })),
    )}
  </dl>
</article>`;

const renderEvidenceGroup = (label, cases) => `<section>
  <h3>${label}</h3>
  ${
    cases.length
      ? cases.map(renderTestEvidence).join("")
      : '<p class="empty">No test found.</p>'
  }
</section>`;

const renderComparison = async (comparison) => {
  const { prerenderedHTML } = await preloadMultiFileDiff({
    oldFile: {
      contents: sourceFor(comparison.original),
      name: `${comparison.id}.functional.js`,
    },
    newFile: {
      contents: sourceFor(comparison.migrated),
      name: `${comparison.id}.integration.js`,
    },
    options: {
      diffIndicators: "bars",
      diffStyle: "split",
      expandUnchanged: true,
      overflow: "scroll",
      themeType: "light",
    },
  });
  const findings = comparison.findings.length
    ? comparison.findings.map(renderFinding).join("")
    : "<li>No structural differences detected.</li>";
  const searchText = [
    comparison.id,
    comparison.status,
    ...comparison.findings,
    ...comparison.original.flatMap(({ file, title }) => [file, title]),
    ...comparison.migrated.flatMap(({ file, title }) => [file, title]),
  ]
    .join(" ")
    .toLowerCase();

  return `<details class="case" data-status="${comparison.status}" data-search="${escapeHtml(
    searchText,
  )}" id="case-${escapeHtml(comparison.id)}" ${
    comparison.status === "green" ? "" : "open"
  }>
  <summary>
    <span class="status-mark" aria-hidden="true"></span>
    <strong>${escapeHtml(comparison.id)}</strong>
    <span class="status-label">${comparison.status}</span>
    <span class="summary-finding">${escapeHtml(
      comparison.findings[0] ?? "No structural differences detected.",
    )}</span>
  </summary>
  <div class="case-body">
    <ul class="findings">${findings}</ul>
    <dl class="metrics">
      <div><dt>Tests</dt><dd>${comparison.original.length} <span>to</span> ${comparison.migrated.length}</dd></div>
      <div><dt>Assertions</dt><dd>${countEvidence(
        comparison.original,
        "assertions",
      )} <span>to</span> ${countEvidence(
        comparison.migrated,
        "assertions",
      )}</dd></div>
      <div><dt>Functional</dt><dd>${escapeHtml(
        caseLocations(comparison.original),
      )}</dd></div>
      <div><dt>Integration</dt><dd>${escapeHtml(
        caseLocations(comparison.migrated),
      )}</dd></div>
    </dl>
    <div class="diff-frame">
      <diffs-container><template shadowrootmode="open">${prerenderedHTML}</template></diffs-container>
    </div>
    <details class="evidence">
      <summary>Structural evidence</summary>
      <div class="evidence-grid">
        ${renderEvidenceGroup("Functional", comparison.original)}
        ${renderEvidenceGroup("Integration", comparison.migrated)}
      </div>
    </details>
  </div>
</details>`;
};

const renderNavigationItem = (comparison) =>
  `<li data-status="${comparison.status}" data-search="${escapeHtml(
    [
      comparison.id,
      ...comparison.findings,
      ...comparison.original.map(({ title }) => title),
      ...comparison.migrated.map(({ title }) => title),
    ]
      .join(" ")
      .toLowerCase(),
  )}"><a href="#case-${escapeHtml(comparison.id)}"><span></span>${escapeHtml(
    comparison.id,
  )}</a></li>`;

const renderUnassigned = (unassigned) => {
  const tests = [...unassigned.functional, ...unassigned.integration];
  if (!tests.length) {
    return "";
  }
  return `<section class="unassigned">
    <h2>Unassigned tests</h2>
    <ul>${tests
      .map(
        ({ file, line, suite, title }) =>
          `<li><strong>${escapeHtml(suite)}</strong> <code>${escapeHtml(
            `${file}:${line}`,
          )}</code> ${escapeHtml(title)}</li>`,
      )
      .join("")}</ul>
  </section>`;
};

const styles = `
@view-transition { navigation: auto; }
:root { --ease-out: cubic-bezier(.23, 1, .32, 1); color-scheme: light; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #202124; background: #f8f9fa; }
* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; min-width: 320px; }
button, input { font: inherit; }
button { border: 1px solid #b8bdc5; border-radius: 4px; background: #fff; color: #202124; min-height: 34px; padding: 5px 10px; cursor: pointer; transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms var(--ease-out); }
@media (hover: hover) and (pointer: fine) {
  button:hover { border-color: #9299a2; background: #f1f3f4; box-shadow: 0 1px 2px rgba(32, 33, 36, .12); }
  button:active { transform: scale(.97); }
}
button:focus-visible, input:focus-visible, summary:focus-visible, a:focus-visible { outline: 3px solid #1967d2; outline-offset: 2px; }
.topbar { position: sticky; top: 0; z-index: 20; display: flex; align-items: center; gap: 20px; min-height: 64px; padding: 10px 20px; border-bottom: 1px solid rgba(201, 205, 210, .8); background: rgba(255, 255, 255, .82); backdrop-filter: blur(18px) saturate(160%); }
.title { min-width: 0; flex: 1; }
.title h1 { margin: 0; font-size: 18px; line-height: 1.3; letter-spacing: 0; overflow-wrap: anywhere; }
.title p { margin: 2px 0 0; color: #62666d; font-size: 12px; }
.counts { display: flex; gap: 14px; margin: 0; font-variant-numeric: tabular-nums; }
.counts div { display: flex; align-items: baseline; gap: 5px; }
.counts dt { color: #62666d; font-size: 12px; text-transform: uppercase; }
.counts dd { margin: 0; font-weight: 700; }
.view-actions { display: flex; gap: 6px; }
.view-actions button, .home-link { white-space: nowrap; }
.home-link { display: inline-flex; align-items: center; gap: 7px; min-height: 34px; padding: 5px 10px; border: 1px solid #b8bdc5; border-radius: 4px; color: #202124; font-size: 13px; font-weight: 600; text-decoration: none; transition: background-color 140ms ease, border-color 140ms ease, box-shadow 140ms ease, transform 140ms var(--ease-out); }
.home-link span { font-size: 17px; line-height: 1; }
@media (hover: hover) and (pointer: fine) {
  .home-link:hover { border-color: #9299a2; background: #f1f3f4; box-shadow: 0 1px 2px rgba(32, 33, 36, .12); }
  .home-link:active { transform: scale(.97); }
}
.shell { display: grid; grid-template-columns: 250px minmax(0, 1fr); max-width: 1800px; margin: 0 auto; }
.shell.sidebar-collapsed { grid-template-columns: minmax(0, 1fr); }
.shell.sidebar-collapsed .sidebar { display: none; }
.sidebar { position: sticky; top: 64px; align-self: start; height: calc(100vh - 64px); overflow: auto; padding: 18px 16px; border-right: 1px solid #d8dadd; background: #fff; }
.search { width: 100%; height: 36px; padding: 6px 9px; border: 1px solid #aeb4bb; border-radius: 4px; }
.filters { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; margin: 14px 0; }
.filters label { display: flex; align-items: center; gap: 5px; font-size: 12px; text-transform: capitalize; }
.actions { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 14px; }
.actions button { font-size: 12px; }
.visible { margin: 0 0 8px; color: #62666d; font-size: 12px; }
.case-nav { margin: 0; padding: 0; list-style: none; }
.case-nav li[hidden] { display: none; }
.case-nav a { display: flex; align-items: center; gap: 8px; min-height: 30px; padding: 3px 5px; border-radius: 3px; color: inherit; font: 600 12px ui-monospace, SFMono-Regular, Menlo, monospace; text-decoration: none; }
.case-nav a:hover { background: #f1f3f4; }
.case-nav span, .status-mark { width: 9px; height: 9px; flex: 0 0 auto; border-radius: 50%; background: #188038; }
[data-status="red"] .status-mark, .case-nav [data-status="red"] span { background: #c5221f; }
[data-status="yellow"] .status-mark, .case-nav [data-status="yellow"] span { background: #e37400; }
.report { min-width: 0; padding: 0 24px 64px; background: #fff; }
.notice { margin: 0 -24px; padding: 14px 24px; border-bottom: 1px solid #d8dadd; color: #4d5156; font-size: 13px; }
.case { scroll-margin-top: 72px; border-bottom: 1px solid #d8dadd; }
.case > summary { display: grid; grid-template-columns: 10px 90px 58px minmax(0, 1fr); align-items: center; gap: 10px; min-height: 54px; cursor: pointer; list-style: none; }
.case > summary::-webkit-details-marker { display: none; }
.case > summary::after { content: "+"; grid-column: 5; color: #62666d; font-size: 20px; }
.case[open] > summary::after { content: "−"; }
.case > summary strong { font: 700 14px ui-monospace, SFMono-Regular, Menlo, monospace; }
.status-label { color: #62666d; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.summary-finding { min-width: 0; overflow: hidden; color: #4d5156; font-size: 13px; text-overflow: ellipsis; white-space: nowrap; }
.case-body { padding: 0 0 26px; }
.findings { margin: 0 0 16px; padding: 12px 16px 12px 34px; border-left: 4px solid #188038; background: #f1f8f3; font-size: 13px; }
[data-status="red"] .findings { border-color: #c5221f; background: #fce8e6; }
[data-status="yellow"] .findings { border-color: #e37400; background: #fef7e0; }
.metrics { display: grid; grid-template-columns: 130px 150px minmax(240px, 1fr) minmax(240px, 1fr); margin: 0 0 16px; border: 1px solid #d8dadd; border-radius: 4px; }
.metrics div { min-width: 0; padding: 9px 11px; border-right: 1px solid #d8dadd; }
.metrics div:last-child { border: 0; }
.metrics dt { margin-bottom: 3px; color: #62666d; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.metrics dd { margin: 0; overflow-wrap: anywhere; font-size: 12px; }
.metrics dd span { color: #62666d; }
.diff-frame { min-width: 0; overflow: hidden; border: 1px solid #c9cdd2; border-radius: 4px; background: #fff; }
diffs-container { display: block; min-width: 0; }
.evidence { margin-top: 12px; border-top: 1px solid #d8dadd; }
.evidence > summary { padding: 12px 0; cursor: pointer; font-size: 13px; font-weight: 600; }
.evidence-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.evidence-grid h3 { margin: 0 0 10px; font-size: 14px; }
.test-evidence { padding: 10px 0; border-top: 1px solid #e4e6e8; }
.test-evidence h4 { margin: 0; font-size: 13px; }
.test-evidence p { display: flex; align-items: center; gap: 8px; margin: 4px 0 8px; color: #62666d; font-size: 11px; overflow-wrap: anywhere; }
.test-evidence dl { display: grid; grid-template-columns: 76px 1fr; gap: 5px 10px; margin: 0; font-size: 12px; }
.test-evidence dt { color: #62666d; font-weight: 600; }
.test-evidence dd { min-width: 0; margin: 0; }
.test-evidence ul { margin: 0; padding: 0; list-style: none; }
.test-evidence li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 6px; margin-bottom: 4px; }
.test-evidence code { overflow-wrap: anywhere; white-space: normal; }
.line { color: #62666d; font: 11px ui-monospace, SFMono-Regular, Menlo, monospace; }
.skipped { color: #b06000; font-size: 10px; text-transform: uppercase; }
.empty { color: #62666d; font-size: 12px; }
.unassigned { padding: 24px 0; border-bottom: 1px solid #d8dadd; }
.unassigned h2 { margin: 0 0 10px; font-size: 16px; }
.unassigned li { margin-bottom: 6px; font-size: 12px; }
[hidden] { display: none !important; }
@media (max-width: 900px) {
  .topbar { align-items: flex-start; flex-direction: column; gap: 8px; position: static; }
  .counts { flex-wrap: wrap; }
  .view-actions { flex-wrap: wrap; }
  .shell { grid-template-columns: 1fr; }
  .sidebar { position: static; width: auto; height: auto; border-right: 0; border-bottom: 1px solid #d8dadd; }
  .case-nav { display: grid; grid-template-columns: repeat(auto-fill, minmax(90px, 1fr)); max-height: 150px; overflow: auto; }
  .report { padding-right: 14px; padding-left: 14px; }
  .notice { margin: 0 -14px; padding-right: 14px; padding-left: 14px; }
  .case { scroll-margin-top: 0; }
  .metrics { grid-template-columns: 1fr 1fr; }
  .metrics div:nth-child(2) { border-right: 0; }
  .metrics div:nth-child(-n + 2) { border-bottom: 1px solid #d8dadd; }
  .evidence-grid { grid-template-columns: 1fr; }
}
@media (max-width: 560px) {
  .case > summary { grid-template-columns: 10px 74px 50px minmax(0, 1fr); gap: 7px; }
  .summary-finding { display: none; }
  .case > summary::after { grid-column: 4; justify-self: end; }
  .metrics { grid-template-columns: 1fr; }
  .metrics div { border-right: 0; border-bottom: 1px solid #d8dadd; }
  .metrics div:nth-child(2) { border-bottom: 1px solid #d8dadd; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  button, .home-link { transition: background-color 140ms ease, border-color 140ms ease; }
  ::view-transition-group(*) { animation-duration: 0s; }
}
@media (prefers-reduced-transparency: reduce) { .topbar { background: #fff; backdrop-filter: none; } }
::view-transition-old(root) { animation: 120ms var(--ease-out) both report-out; }
::view-transition-new(root) { animation: 220ms var(--ease-out) both report-in; }
@keyframes report-out { to { opacity: 0; transform: scale(.995); } }
@keyframes report-in { from { opacity: 0; transform: scale(.99); } }
@media print {
  .topbar { position: static; }
  .sidebar { display: none; }
  .shell { display: block; }
  .report { padding: 0; }
  .case { break-inside: avoid; }
}
`;

export const renderHtml = async (review) => {
  const counts = countStatuses(review.comparisons);
  const comparisons = await Promise.all(
    review.comparisons.map(renderComparison),
  );
  const unassignedCount =
    review.unassigned.functional.length + review.unassigned.integration.length;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(review.branchRef)} migration review</title>
  <style>${styles}</style>
</head>
<body>
  <header class="topbar">
    <div class="title">
      <h1>${escapeHtml(review.branchRef)}</h1>
      <p>Compared with ${escapeHtml(review.baseRef)} · ${
        review.functionalFiles?.length ?? 0
      } functional files · ${review.integrationFiles?.length ?? 0} integration files</p>
    </div>
    <dl class="counts">
      <div><dt>Red</dt><dd>${counts.red}</dd></div>
      <div><dt>Yellow</dt><dd>${counts.yellow}</dd></div>
      <div><dt>Green</dt><dd>${counts.green}</dd></div>
      <div><dt>Unassigned</dt><dd>${unassignedCount}</dd></div>
    </dl>
    <div id="report-controls" class="view-actions"><a class="home-link" href="./index.html"><span aria-hidden="true">←</span>All reports</a></div>
  </header>
  <div class="shell">
    <aside class="sidebar" id="case-sidebar">
      <input class="search" id="search" type="search" placeholder="Search IDs, files, findings" aria-label="Search cases">
      <div class="filters" aria-label="Status filters">
        <label><input type="checkbox" value="red" data-status-filter checked> Red</label>
        <label><input type="checkbox" value="yellow" data-status-filter checked> Yellow</label>
        <label><input type="checkbox" value="green" data-status-filter checked> Green</label>
      </div>
      <div class="actions">
        <button id="open-flagged" type="button">Open flagged</button>
        <button id="collapse-all" type="button">Collapse all</button>
      </div>
      <p class="visible"><span id="visible-count">${
        review.comparisons.length
      }</span> of ${review.comparisons.length} cases</p>
      <nav aria-label="Test cases"><ul class="case-nav">${review.comparisons
        .map(renderNavigationItem)
        .join("")}</ul></nav>
    </aside>
    <main class="report">
      <p class="notice">This report identifies structural differences. Green is a fast-review candidate, not proof of semantic equivalence.</p>
      ${renderUnassigned(review.unassigned)}
      ${comparisons.join("")}
    </main>
  </div>
  <script>${clientScript}</script>
</body>
</html>
`;
};
