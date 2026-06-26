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

import { readFileSync } from "fs";
import { basename } from "path";
import yaml from "js-yaml";
import { JIRA_BASE_URL, JIRA_API_TOKEN } from "../team/config.js";

function usage() {
  console.error("Usage: apply.mjs [--dry-run] <filename>");
  console.error("  <filename>  Path to a .jira/*.yml file");
  process.exit(1);
}

const args = process.argv.slice(2).filter((a) => a !== "--dry-run");
const dryRun = process.argv.slice(2).includes("--dry-run");

if (args.length < 1) {
  usage();
}

const [filename] = args;

// Parse ticket key from filename: {PROJECT}-{NUMBER}-*.yml or {PROJECT}-XXXX-*.yml
const fileBase = basename(filename, ".yml");
const keyMatch = fileBase.match(/^([A-Z]+-(?:XXXX|\d+))/);
if (!keyMatch) {
  console.error(`Cannot parse ticket key from filename: ${filename}`);
  process.exit(1);
}
const fileKey = keyMatch[1];
const isNewTicket = fileKey.endsWith("-XXXX") || fileKey.includes("XXXX");

const parsed = yaml.load(readFileSync(filename, "utf8")) ?? {};
const updates = parsed.updates ?? [];
const hasUpdates = Array.isArray(updates) && updates.length > 0;

// Validate env vars only when updates are present
if (hasUpdates && !dryRun) {
  if (!JIRA_API_TOKEN) {
    console.error("JIRA_API_TOKEN is required");
    process.exit(1);
  }
  if (!process.env.GITHUB_PR_URL) {
    console.error("GITHUB_PR_URL is required when updates are present");
    process.exit(1);
  }
  if (!process.env.GITHUB_PR_TITLE) {
    console.error("GITHUB_PR_TITLE is required when updates are present");
    process.exit(1);
  }
}

const GITHUB_PR_URL = process.env.GITHUB_PR_URL ?? "";
const GITHUB_PR_TITLE = process.env.GITHUB_PR_TITLE ?? "";
const GITHUB_PR_NUMBER = process.env.GITHUB_PR_NUMBER ?? "";
const globalId = `repo-${GITHUB_PR_NUMBER}`;
const baseUrl = JIRA_BASE_URL.replace(/\/$/, "");

async function jiraRequest(method, path, body) {
  const url = `${baseUrl}${path}`;
  if (dryRun) {
    console.log(`[dry-run] ${method} ${url}`);
    if (body !== undefined) {
      console.log(JSON.stringify(body, null, 2));
    }
    return { ok: true, status: 200, json: async () => ({}) };
  }
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${JIRA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`JIRA ${method} ${path} failed: ${response.status} ${text}`);
    process.exit(1);
  }
  return response;
}

async function resolveTicketKey() {
  if (!isNewTicket) {
    // Existing ticket: parse key directly from filename
    return fileKey; // e.g. PDCL-1234
  }

  // New ticket (XXXX): search for an existing ticket with our remote link globalId
  // to maintain idempotency across workflow re-runs.
  if (GITHUB_PR_NUMBER) {
    const foundKey = await searchByRemoteLinkGlobalId(globalId);
    if (foundKey) {
      console.log(`Found existing ticket ${foundKey} via remote link globalId ${globalId}`);
      return foundKey;
    }
  }

  // No existing ticket found — create one
  const createUpdate = updates.find(
    (u) => u.method === "POST" && u.path === "/rest/api/2/issue",
  );
  if (!createUpdate) {
    console.error("XXXX file has no POST /rest/api/2/issue entry in updates");
    process.exit(1);
  }

  if (dryRun) {
    await jiraRequest("POST", "/rest/api/2/issue", createUpdate.body);
    return "PDCL-XXXX";
  }

  const response = await jiraRequest("POST", "/rest/api/2/issue", createUpdate.body);
  const data = await response.json();
  return data.key;
}

async function searchByRemoteLinkGlobalId(searchGlobalId) {
  // Search recently created PDCL issues and check their remote links for our globalId.
  // Scoped to the past 7 days to keep the result set small — the ticket was created recently.
  const jql = encodeURIComponent(
    `project = PDCL AND created >= startOfDay("-7d") ORDER BY created DESC`,
  );
  const url = `${baseUrl}/rest/api/2/search?jql=${jql}&fields=key&maxResults=50`;
  if (dryRun) {
    console.log(`[dry-run] Search for existing ticket: GET ${url}`);
    return null;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${JIRA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) return null;

  const data = await response.json();
  const issues = data.issues ?? [];

  for (const issue of issues) {
    const linksUrl = `${baseUrl}/rest/api/2/issue/${issue.key}/remotelink`;
    const linksResponse = await fetch(linksUrl, {
      headers: {
        Authorization: `Bearer ${JIRA_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    if (!linksResponse.ok) continue;
    const links = await linksResponse.json();
    const match = links.find((l) => l.globalId === searchGlobalId);
    if (match) return issue.key;
  }
  return null;
}

async function remoteLinksForIssue(key) {
  if (dryRun) return [];
  const response = await fetch(`${baseUrl}/rest/api/2/issue/${key}/remotelink`, {
    headers: {
      Authorization: `Bearer ${JIRA_API_TOKEN}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) return [];
  return response.json();
}

// ── Main ────────────────────────────────────────────────────────────────────

const ticketKey = await resolveTicketKey();

if (!hasUpdates) {
  if (dryRun) console.log(`[dry-run] No updates — would print key: ${ticketKey}`);
  console.log(ticketKey);
  process.exit(0);
}

// Execute each update in order, skipping the create call for new tickets
// (it was handled during key resolution above)
const isCreate = (u) =>
  isNewTicket && u.method === "POST" && u.path === "/rest/api/2/issue";

for (const update of updates) {
  if (isCreate(update)) continue;

  // Resolve {key} placeholder in path if present
  const path = update.path.replace(/\{key\}/g, ticketKey);
  await jiraRequest(update.method, path, update.body);
}

// Create remote link after all updates
if (GITHUB_PR_URL && GITHUB_PR_NUMBER) {
  const existingLinks = await remoteLinksForIssue(ticketKey);
  const alreadyLinked = existingLinks.some((l) => l.globalId === globalId);

  if (alreadyLinked) {
    console.log(`Remote link ${globalId} already exists on ${ticketKey} — skipping`);
  } else {
    await jiraRequest("POST", `/rest/api/2/issue/${ticketKey}/remotelink`, {
      globalId,
      relationship: "mentioned in",
      object: {
        url: GITHUB_PR_URL,
        title: GITHUB_PR_TITLE || GITHUB_PR_URL,
      },
    });
  }
}

console.log(ticketKey);
