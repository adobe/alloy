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

import { readFileSync, writeFileSync, existsSync } from "fs";
import yaml from "js-yaml";
import { JIRA_BASE_URL, JIRA_API_TOKEN } from "../team/config.js";

const MAX_STRING_LENGTH = 500;

function usage() {
  console.error("Usage: fetch.mjs [--dry-run] <ticket-key> <filename>");
  console.error("  <ticket-key>  JIRA issue key, e.g. PDCL-1234");
  console.error("  <filename>    Path to write, e.g. .jira/PDCL-1234-my-feature.yml");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
const dryRun = process.argv.slice(2).includes("--dry-run");

if (args.length < 2) {
  usage();
}

const [ticketKey, filename] = args;

if (!dryRun && !JIRA_API_TOKEN) {
  console.error("JIRA_API_TOKEN is required");
  process.exit(1);
}

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
    } else if (typeof value === "object" && !Array.isArray(value)) {
      const nested = extractFields(value);
      if (Object.keys(nested).length > 0) {
        result[key] = nested;
      }
    } else if (Array.isArray(value)) {
      const filtered = value
        .map((item) =>
          typeof item === "object" && item !== null
            ? extractFields(item)
            : item,
        )
        .filter((item) =>
          typeof item === "object" ? Object.keys(item).length > 0 : isNonEmpty(item),
        );
      if (filtered.length > 0) {
        result[key] = filtered;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}

async function fetchIssue(key) {
  const url = `${JIRA_BASE_URL.replace(/\/$/, "")}/rest/api/2/issue/${encodeURIComponent(key)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${JIRA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`JIRA GET failed: ${response.status} ${text}`);
    process.exit(1);
  }
  return response.json();
}

function buildDetailsYaml(details, timestamp) {
  const comment = `# fetched from JIRA ${timestamp}`;
  const detailsYaml = yaml.dump({ details }, { lineWidth: 120, noRefs: true });
  return `${comment}\n${detailsYaml}`;
}

function mergeWithExisting(detailsYaml, filename) {
  if (!existsSync(filename)) {
    return detailsYaml;
  }
  const existing = yaml.load(readFileSync(filename, "utf8"));
  if (!existing?.updates) {
    return detailsYaml;
  }
  const detailsParsed = yaml.load(detailsYaml);
  const merged = { ...detailsParsed, updates: existing.updates };
  const timestamp = detailsYaml.match(/# fetched from JIRA (.+)/)?.[1] ?? new Date().toISOString();
  const mergedYaml = yaml.dump(merged, { lineWidth: 120, noRefs: true });
  return `# fetched from JIRA ${timestamp}\n${mergedYaml}`;
}

if (dryRun) {
  const url = `${JIRA_BASE_URL.replace(/\/$/, "")}/rest/api/2/issue/${encodeURIComponent(ticketKey)}`;
  console.log(`[dry-run] Would fetch: GET ${url}`);
  console.log(`[dry-run] Would write to: ${filename}`);
  process.exit(0);
}

const data = await fetchIssue(ticketKey);
const details = {
  key: data.key,
  ...extractFields(data.fields ?? {}),
};

const timestamp = new Date().toISOString();
const detailsYaml = buildDetailsYaml(details, timestamp);
const finalYaml = mergeWithExisting(detailsYaml, filename);

writeFileSync(filename, finalYaml, "utf8");
console.log(`Wrote ${filename}`);
