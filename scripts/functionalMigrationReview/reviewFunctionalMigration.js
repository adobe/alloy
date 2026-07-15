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

import { execFileSync, spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rules = fs.readFileSync(path.join(scriptDirectory, "rules.yml"), "utf8");
const caseIdPattern = /\b(?:C|MA)\d+\b/i;
const inventoryCache = new Map();
const exactMatchers = new Set([
  "eql",
  "notEql",
  "toBe",
  "toEqual",
  "toStrictEqual",
]);

const getSingle = (match, name) => match.metaVariables.single[name]?.text ?? "";
const getMulti = (match, name) =>
  (match.metaVariables.multi[name] ?? []).map(({ text }) => text);
const getStart = (match) => match.range.byteOffset.start;
const getEnd = (match) => match.range.byteOffset.end;
const getLine = (match) => match.range.start.line + 1;

const splitStaticString = (value) => {
  const parts = [];
  let quote;
  let escaped = false;
  let start = 0;
  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (escaped) {
      escaped = false;
    } else if (character === "\\") {
      escaped = true;
    } else if (quote) {
      if (character === quote) {
        quote = undefined;
      }
    } else if (['"', "'", "`"].includes(character)) {
      quote = character;
    } else if (character === "+") {
      parts.push(value.slice(start, index).trim());
      start = index + 1;
    }
  }
  parts.push(value.slice(start).trim());
  return parts;
};

const decodeSingleQuotedString = (value) => {
  const escapes = new Map([
    ["b", "\b"],
    ["f", "\f"],
    ["n", "\n"],
    ["r", "\r"],
    ["t", "\t"],
    ["v", "\v"],
  ]);
  let result = "";
  for (let index = 1; index < value.length - 1; index += 1) {
    const character = value[index];
    if (character !== "\\") {
      result += character;
      continue;
    }
    index += 1;
    result += escapes.get(value[index]) ?? value[index] ?? "";
  }
  return result;
};

const parseStaticStringLiteral = (value) => {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      return JSON.parse(trimmed);
    } catch {
      return undefined;
    }
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return decodeSingleQuotedString(trimmed);
  }
  if (
    trimmed.startsWith("`") &&
    trimmed.endsWith("`") &&
    !trimmed.includes("${")
  ) {
    return decodeSingleQuotedString(trimmed);
  }
  return undefined;
};

const parseStaticString = (value) => {
  if (!value) {
    return "";
  }
  const parts = splitStaticString(value);
  const parsed = parts.map(parseStaticStringLiteral);
  if (parsed.every((part) => part !== undefined)) {
    return parsed.join("");
  }
  return value;
};

const findCaseId = (value) => {
  const match = value.match(caseIdPattern);
  return match?.[0].toUpperCase();
};

const getTestTitle = (match) =>
  getSingle(match, "TITLE") || getMulti(match, "ARGS")[0] || "";

const normalizeCommand = (command) =>
  command.replace(/(?:Async|ErrorMessage)$/, "");

const runAstGrep = (source) => {
  const result = spawnSync(
    "ast-grep",
    ["scan", "--inline-rules", rules, "--stdin", "--json=compact"],
    {
      encoding: "utf8",
      input: source,
      maxBuffer: 20 * 1024 * 1024,
    },
  );

  if (result.error) {
    throw new Error(`Unable to run ast-grep: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "ast-grep failed");
  }
  return JSON.parse(result.stdout || "[]");
};

const isInside = (match, container) =>
  getStart(match) >= getStart(container) && getEnd(match) <= getEnd(container);

const findNearestCaseId = (testMatch, describeMatches, fallbackId) => {
  const titleId = findCaseId(parseStaticString(getTestTitle(testMatch)));
  if (titleId) {
    return titleId;
  }

  const containingDescribe = describeMatches
    .filter((describeMatch) => isInside(testMatch, describeMatch))
    .sort(
      (left, right) =>
        getEnd(left) - getStart(left) - (getEnd(right) - getStart(right)),
    )
    .find((describeMatch) =>
      findCaseId(parseStaticString(getSingle(describeMatch, "TITLE"))),
    );

  return containingDescribe
    ? findCaseId(parseStaticString(getSingle(containingDescribe, "TITLE")))
    : fallbackId;
};

const createCommand = (match) => {
  const command =
    match.ruleId === "integration-alloy-command"
      ? parseStaticString(getSingle(match, "COMMAND"))
      : getSingle(match, "COMMAND");
  return {
    args: getMulti(match, "ARGS"),
    line: getLine(match),
    name: normalizeCommand(command),
    text: match.text,
  };
};

const createAssertion = (match) => {
  const matcher = getSingle(match, "MATCHER");
  return {
    actual: getSingle(match, "ACTUAL"),
    expected: getMulti(match, "EXPECTED"),
    exact: exactMatchers.has(matcher),
    line: getLine(match),
    matcher,
    text: match.text,
  };
};

const createStateOperation = (match) => {
  if (
    ["state-location-assignment", "state-url-helper"].includes(match.ruleId)
  ) {
    return {
      line: getLine(match),
      signature: "location",
      text: match.text,
    };
  }
  if (match.ruleId === "state-cookie-assignment") {
    return {
      line: getLine(match),
      signature: "document.cookie",
      text: match.text,
    };
  }
  return {
    line: getLine(match),
    signature: `${getSingle(match, "STORAGE")}.${getSingle(match, "METHOD")}`,
    text: match.text,
  };
};

const uniqueByRangeAndRule = (matches) =>
  matches.filter(
    (match, index) =>
      matches.findIndex(
        (candidate) =>
          candidate.ruleId === match.ruleId &&
          getStart(candidate) === getStart(match) &&
          getEnd(candidate) === getEnd(match),
      ) === index,
  );

export const inventorySource = ({ file, source, suite }) => {
  const matches = uniqueByRangeAndRule(runAstGrep(source));
  const describeMatches = matches.filter(
    ({ ruleId }) => ruleId === "describe-block",
  );
  const testMatches = matches
    .filter(({ ruleId }) => ["test-case", "skipped-test-case"].includes(ruleId))
    .sort(
      (left, right) =>
        Number(right.ruleId === "skipped-test-case") -
        Number(left.ruleId === "skipped-test-case"),
    )
    .filter(
      (match, index, candidates) =>
        candidates.findIndex(
          (candidate) =>
            getStart(candidate) === getStart(match) &&
            getEnd(candidate) === getEnd(match),
        ) === index,
    );
  const fallbackId = findCaseId(path.basename(file));

  const cases = testMatches.map((testMatch) => {
    const containedMatches = matches.filter(
      (match) => match !== testMatch && isInside(match, testMatch),
    );
    return {
      assertions: containedMatches
        .filter(({ ruleId }) => ruleId.includes("assertion"))
        .map(createAssertion),
      commands: containedMatches
        .filter(({ ruleId }) =>
          ["legacy-alloy-command", "integration-alloy-command"].includes(
            ruleId,
          ),
        )
        .map(createCommand),
      file,
      id: findNearestCaseId(testMatch, describeMatches, fallbackId),
      line: getLine(testMatch),
      risks: containedMatches
        .filter(({ ruleId }) => ruleId.startsWith("risk-"))
        .map(({ ruleId, text }) => ({ kind: ruleId, text })),
      skipped: testMatch.ruleId === "skipped-test-case",
      source: testMatch.text,
      stateOperations: containedMatches
        .filter(({ ruleId }) => ruleId.startsWith("state-"))
        .map(createStateOperation),
      suite,
      title: parseStaticString(getTestTitle(testMatch)),
    };
  });

  return {
    cases,
    file,
    unassigned: cases.filter(({ id }) => !id),
  };
};

const groupCases = (cases) =>
  Map.groupBy(
    cases.filter(({ id }) => id),
    ({ id }) => id,
  );

const countBy = (values) =>
  values.reduce((counts, value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
    return counts;
  }, new Map());

const findMissingValues = (originalValues, migratedValues) => {
  const originalCounts = countBy(originalValues);
  const migratedCounts = countBy(migratedValues);
  return [...originalCounts.entries()]
    .filter(([value, count]) => (migratedCounts.get(value) ?? 0) < count)
    .map(([value]) => value);
};

const flatten = (cases, property) =>
  cases.flatMap((testCase) => testCase[property]);

const compareCaseGroup = (id, original = [], migrated = []) => {
  const issues = [];
  const addIssue = (severity, message) => issues.push({ message, severity });

  if (migrated.length === 0) {
    addIssue("red", "No migrated test was found.");
  } else {
    if (migrated.length < original.length) {
      addIssue(
        "red",
        `Test count decreased from ${original.length} to ${migrated.length}.`,
      );
    }

    const originalSkipped = original.filter(({ skipped }) => skipped).length;
    const migratedSkipped = migrated.filter(({ skipped }) => skipped).length;
    if (migratedSkipped > originalSkipped) {
      addIssue(
        "red",
        `Skipped test count increased from ${originalSkipped} to ${migratedSkipped}.`,
      );
    }

    const activeOriginal = original.filter(({ skipped }) => !skipped);
    const activeMigrated = migrated.filter(({ skipped }) => !skipped);
    const originalAssertions = flatten(activeOriginal, "assertions");
    const migratedAssertions = flatten(activeMigrated, "assertions");
    if (migratedAssertions.length < originalAssertions.length) {
      addIssue(
        "red",
        `Assertion count decreased from ${originalAssertions.length} assertions to ${migratedAssertions.length}.`,
      );
    }

    const originalExact = originalAssertions.filter(
      ({ exact }) => exact,
    ).length;
    const migratedExact = migratedAssertions.filter(
      ({ exact }) => exact,
    ).length;
    if (migratedExact < originalExact) {
      addIssue(
        "red",
        `Exact assertion count decreased from ${originalExact} to ${migratedExact}.`,
      );
    }

    const originalCommands = flatten(activeOriginal, "commands").map(
      ({ name }) => name,
    );
    const migratedCommands = flatten(activeMigrated, "commands").map(
      ({ name }) => name,
    );
    const missingCommands = findMissingValues(
      originalCommands,
      migratedCommands,
    );
    if (missingCommands.length) {
      addIssue(
        "red",
        `Alloy command evidence is missing: ${missingCommands.join(", ")}.`,
      );
    } else if (originalCommands.join() !== migratedCommands.join()) {
      addIssue("yellow", "Alloy command order changed.");
    }

    const originalState = flatten(activeOriginal, "stateOperations").map(
      ({ signature }) => signature,
    );
    const migratedState = flatten(activeMigrated, "stateOperations").map(
      ({ signature }) => signature,
    );
    const missingState = findMissingValues(originalState, migratedState);
    if (missingState.length) {
      addIssue(
        "red",
        `Original state operation evidence is missing: ${missingState.join(", ")}.`,
      );
    }

    const riskKinds = new Set(
      [
        ...flatten(activeOriginal, "risks"),
        ...flatten(activeMigrated, "risks"),
      ].map(({ kind }) => kind),
    );
    if (riskKinds.size) {
      addIssue(
        "yellow",
        `Manual async/state review is required: ${[...riskKinds].join(", ")}.`,
      );
    }
  }

  const status = issues.some(({ severity }) => severity === "red")
    ? "red"
    : issues.length
      ? "yellow"
      : "green";

  return {
    findings: issues.map(({ message }) => message),
    id,
    migrated,
    original,
    status,
  };
};

export const compareCaseGroups = (originalCases, migratedCases) => {
  const originalGroups = groupCases(originalCases);
  const migratedGroups = groupCases(migratedCases);
  const ids = [
    ...new Set([...originalGroups.keys(), ...migratedGroups.keys()]),
  ];
  return ids
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true }),
    )
    .map((id) =>
      compareCaseGroup(id, originalGroups.get(id), migratedGroups.get(id)),
    );
};

const splitLines = (value) => value.trim().split("\n").filter(Boolean);

const listFilesAtRef = (ref, directory, { recursive = false } = {}) =>
  execFileSync("git", ["ls-tree", "-r", "--name-only", ref, directory], {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(
      (file) =>
        file.endsWith(".js") &&
        (recursive ||
          path.posix.dirname(file) === directory.replace(/\/$/, "")),
    );

const readFileAtRef = (ref, file) =>
  execFileSync("git", ["show", `${ref}:${file}`], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });

const inventoryFileAtRef = ({ file, ref, suite }) => {
  const cacheKey = `${ref}:${file}:${suite}`;
  if (!inventoryCache.has(cacheKey)) {
    inventoryCache.set(
      cacheKey,
      inventorySource({
        file,
        source: readFileAtRef(ref, file),
        suite,
      }).cases,
    );
  }
  return inventoryCache.get(cacheKey);
};

const inventoryFilesAtRef = ({ files, ref, suite }) =>
  files.flatMap((file) => inventoryFileAtRef({ file, ref, suite }));

export const selectFunctionalCases = ({
  allFunctionalCases,
  historicallyDeletedFiles,
  migratedCases,
}) => {
  const deletedFiles = new Set(historicallyDeletedFiles);
  const migratedIds = new Set(
    migratedCases.map(({ id }) => id).filter(Boolean),
  );
  const partiallyMigratedFiles = new Set(
    allFunctionalCases
      .filter(({ id }) => migratedIds.has(id))
      .map(({ file }) => file),
  );
  return allFunctionalCases.filter(
    ({ file }) => deletedFiles.has(file) || partiallyMigratedFiles.has(file),
  );
};

const listChangedFiles = ({ baseRef, branchRef, directory }) =>
  splitLines(
    execFileSync(
      "git",
      [
        "diff",
        "--name-only",
        "--diff-filter=ACMRT",
        `${baseRef}...${branchRef}`,
        "--",
        directory,
      ],
      { encoding: "utf8" },
    ),
  ).filter((file) => file.endsWith(".js"));

const listHistoricallyDeletedFiles = ({ baseRef, branchRef, directory }) => [
  ...new Set(
    splitLines(
      execFileSync(
        "git",
        [
          "log",
          "--format=",
          "--name-only",
          "--diff-filter=D",
          `${baseRef}..${branchRef}`,
          "--",
          directory,
        ],
        { encoding: "utf8" },
      ),
    ).filter((file) => file.endsWith(".js")),
  ),
];

export const reviewBranch = ({
  baseRef,
  branchRef,
  functionalRoot = "packages/browser/test/functional/specs",
  integrationRoot = "packages/browser/test/integration/specs",
}) => {
  const integrationFiles = listChangedFiles({
    baseRef,
    branchRef,
    directory: integrationRoot,
  });
  const migrated = inventoryFilesAtRef({
    files: integrationFiles,
    ref: branchRef,
    suite: "integration",
  });
  const allFunctionalCases = inventoryFilesAtRef({
    files: listFilesAtRef(baseRef, functionalRoot, { recursive: true }),
    ref: baseRef,
    suite: "functional",
  });
  const historicallyDeletedFiles = listHistoricallyDeletedFiles({
    baseRef,
    branchRef,
    directory: functionalRoot,
  });
  const original = selectFunctionalCases({
    allFunctionalCases,
    historicallyDeletedFiles,
    migratedCases: migrated,
  });

  return {
    baseRef,
    branchRef,
    comparisons: compareCaseGroups(original, migrated),
    functionalFiles: [...new Set(original.map(({ file }) => file))],
    functionalPath: `${functionalRoot} (branch scope)`,
    integrationFiles,
    integrationPath: `${integrationRoot} (changed files)`,
    unassigned: {
      functional: original.filter(({ id }) => !id),
      integration: migrated.filter(({ id }) => !id),
    },
  };
};

export const reviewMigration = ({
  baseRef,
  branchRef,
  functionalPath,
  integrationPath,
}) => {
  const functionalFiles = listFilesAtRef(baseRef, functionalPath);
  const integrationFiles = listFilesAtRef(branchRef, integrationPath);
  const original = inventoryFilesAtRef({
    files: functionalFiles,
    ref: baseRef,
    suite: "functional",
  });
  const migrated = inventoryFilesAtRef({
    files: integrationFiles,
    ref: branchRef,
    suite: "integration",
  });
  return {
    baseRef,
    branchRef,
    comparisons: compareCaseGroups(original, migrated),
    functionalFiles,
    functionalPath,
    integrationFiles,
    integrationPath,
    unassigned: {
      functional: original.filter(({ id }) => !id),
      integration: migrated.filter(({ id }) => !id),
    },
  };
};

const renderCaseLocations = (cases) =>
  [...new Set(cases.map(({ file, line }) => `${file}:${line}`))].join(", ");

const formatEvidence = (value) =>
  value.replace(/\s+/g, " ").replaceAll("`", "'").slice(0, 240);

const renderEvidence = (label, cases) => {
  const lines = [`### ${label} Evidence`, ""];
  cases.forEach((testCase) => {
    lines.push(
      `- Test: \`${testCase.file}:${testCase.line}\` ${testCase.skipped ? "(skipped) " : ""}${testCase.title}`,
    );
    testCase.commands.forEach(({ line, text }) =>
      lines.push(`- Command L${line}: \`${formatEvidence(text)}\``),
    );
    testCase.stateOperations.forEach(({ line, text }) =>
      lines.push(`- State L${line}: \`${formatEvidence(text)}\``),
    );
    testCase.assertions.forEach(({ line, text }) =>
      lines.push(`- Assertion L${line}: \`${formatEvidence(text)}\``),
    );
    testCase.risks.forEach(({ kind, text }) =>
      lines.push(`- Risk ${kind}: \`${formatEvidence(text)}\``),
    );
  });
  if (cases.length === 0) {
    lines.push("- Not found.");
  }
  lines.push("");
  return lines;
};

export const renderMarkdown = (review, { includeEvidence = false } = {}) => {
  const counts = countBy(review.comparisons.map(({ status }) => status));
  const lines = [
    "# Functional Migration Review",
    "",
    `- Base: \`${review.baseRef}\``,
    `- Branch: \`${review.branchRef}\``,
    `- Functional: \`${review.functionalPath}\``,
    `- Integration: \`${review.integrationPath}\``,
    `- Results: ${counts.get("red") ?? 0} red, ${counts.get("yellow") ?? 0} yellow, ${counts.get("green") ?? 0} green`,
    `- Unassigned tests: ${review.unassigned.functional.length} functional, ${review.unassigned.integration.length} integration`,
    "",
    "This report identifies structural differences. A green result is a fast-review candidate, not proof of semantic equivalence.",
    "",
  ];

  review.comparisons.forEach((comparison) => {
    lines.push(`## ${comparison.status.toUpperCase()} ${comparison.id}`, "");
    lines.push(
      `- Functional: ${renderCaseLocations(comparison.original) || "not found"}`,
      `- Integration: ${renderCaseLocations(comparison.migrated) || "not found"}`,
      `- Tests: ${comparison.original.length} → ${comparison.migrated.length}`,
      `- Assertions: ${
        flatten(
          comparison.original.filter(({ skipped }) => !skipped),
          "assertions",
        ).length
      } → ${
        flatten(
          comparison.migrated.filter(({ skipped }) => !skipped),
          "assertions",
        ).length
      }`,
    );
    if (comparison.findings.length) {
      comparison.findings.forEach((finding) => lines.push(`- ${finding}`));
    } else {
      lines.push("- No structural differences detected.");
    }
    lines.push("");
    const shouldIncludeEvidence =
      includeEvidence === true || includeEvidence.includes?.(comparison.status);
    if (shouldIncludeEvidence) {
      lines.push(
        ...renderEvidence("Functional", comparison.original),
        ...renderEvidence("Integration", comparison.migrated),
      );
    }
  });

  return `${lines.join("\n")}\n`;
};
