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

import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { load as yamlLoad, dump as yamlDump } from "js-yaml";
import createApi from "./api.js";
import { JIRA_BASE_URL, JIRA_API_TOKEN } from "../team/config.js";

const MAX_STRING_LENGTH = 500;

function truncate(value) {
  if (typeof value === "string" && value.length > MAX_STRING_LENGTH) {
    return value.slice(0, MAX_STRING_LENGTH) + "...";
  }
  return value;
}

function isNonEmpty(value) {
  if (value === null || value === undefined) return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

function extractFields(fields) {
  const result = {};
  for (const [key, value] of Object.entries(fields)) {
    if (!isNonEmpty(value)) continue;
    if (typeof value === "string") {
      result[key] = truncate(value);
    } else if (Array.isArray(value)) {
      const filtered = value
        .map((item) =>
          typeof item === "object" && item !== null
            ? extractFields(item)
            : item,
        )
        .filter((item) =>
          typeof item === "object"
            ? Object.keys(item).length > 0
            : isNonEmpty(item),
        );
      if (filtered.length > 0) result[key] = filtered;
    } else if (typeof value === "object") {
      const nested = extractFields(value);
      if (Object.keys(nested).length > 0) result[key] = nested;
    } else {
      result[key] = value;
    }
  }
  return result;
}

function buildYaml(details, timestamp) {
  return `# fetched from JIRA ${timestamp}\n${yamlDump({ details }, { lineWidth: 120, noRefs: true })}`;
}

/**
 * Fetch live JIRA state for a ticket and write it to a file.
 * @param {string} ticketKey  e.g. "PDCL-1234"
 * @param {string} filename   target file path
 * @param {{ api: object }} opts
 */
export async function fetchFile(ticketKey, filename, { api }) {
  const data = await api.request(
    "GET",
    `/rest/api/2/issue/${encodeURIComponent(ticketKey)}`,
  );
  const details = { key: data.key, ...extractFields(data.fields ?? {}) };
  const timestamp = new Date().toISOString();
  const content = buildYaml(details, timestamp);

  if (api.dryRun) {
    console.log(`[dry-run] Would write to ${filename}:\n${content}`);
    return;
  }

  writeFileSync(filename, content, "utf8");
  console.log(`Wrote ${filename}`);
}

// Script entry point — only executes when run directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rawArgs = process.argv.slice(2);
  const dryRun = rawArgs.includes("--dry-run");
  const args = rawArgs.filter((a) => a !== "--dry-run");

  if (args.length < 2) {
    console.error("Usage: fetch.js [--dry-run] <ticket-key> <filename>");
    console.error("  <ticket-key>  JIRA issue key, e.g. PDCL-1234");
    console.error(
      "  <filename>    Path to write, e.g. .jira/PDCL-1234-my-feature.yml",
    );
    process.exit(1);
  }

  const [ticketKey, filename] = args;

  if (!JIRA_API_TOKEN) {
    console.error("JIRA_API_TOKEN is required");
    process.exit(1);
  }

  const api = createApi({
    dryRun,
    baseUrl: JIRA_BASE_URL.replace(/\/$/, ""),
    token: JIRA_API_TOKEN ?? "",
  });

  fetchFile(ticketKey, filename, { api }).catch((e) => {
    console.error(e.message);
    process.exit(1);
  });
}
