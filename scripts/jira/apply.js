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
import { fileURLToPath } from "url";
import { load as yamlLoad } from "js-yaml";
import createApi from "./api.js";
import { JIRA_BASE_URL, JIRA_API_TOKEN } from "../team/config.js";

// Recursively replace {PLACEHOLDER} tokens in body values.
function interpolate(value, vars) {
  if (typeof value === "string") {
    return value.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
  }
  if (Array.isArray(value)) return value.map((v) => interpolate(v, vars));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, interpolate(v, vars)]),
    );
  }
  return value;
}

/**
 * Apply a .jira/*.yml file's updates to JIRA.
 * @param {string} filename
 * @param {{ api: object, prUrl?: string, prTitle?: string }} opts
 * @returns {Promise<string>} resolved ticket key, e.g. "PDCL-1234"
 */
export async function applyFile(filename, { api, prUrl = "", prTitle = "" }) {
  const fileBase = basename(filename, ".yml");
  const keyMatch = fileBase.match(/^([A-Z]+-(?:XXXX|\d+))/);
  if (!keyMatch)
    throw new Error(`Cannot parse ticket key from filename: ${filename}`);

  const fileKey = keyMatch[1];
  const isNewTicket = fileKey.includes("XXXX");
  const parsed = yamlLoad(readFileSync(filename, "utf8")) ?? {};
  const updates = Array.isArray(parsed.updates) ? parsed.updates : [];
  const hasUpdates = updates.length > 0;

  const vars = { GITHUB_PR_URL: prUrl, GITHUB_PR_TITLE: prTitle };

  // For new tickets, find the remote-link entry to get its globalId (idempotency key).
  const remoteLinkUpdate = updates.find(
    (u) => u.method === "POST" && String(u.path).includes("/remotelink"),
  );
  const globalId = remoteLinkUpdate?.body?.globalId;

  async function resolveKey() {
    if (!isNewTicket) return fileKey;

    // Search for an existing ticket that already has this globalId on its remote links.
    if (globalId) {
      const issues = await api.searchIssues(
        `project = PDCL AND created >= startOfDay("-7d") ORDER BY created DESC`,
      );
      for (const issue of issues) {
        const links = await api.getRemoteLinks(issue.key);
        if (links.some((l) => l.globalId === globalId)) {
          console.log(
            `Found existing ticket ${issue.key} via globalId ${globalId}`,
          );
          // Update the existing ticket with the create details to ensure idempotency.
          const createUpdate = updates.find(
            (u) => u.method === "POST" && u.path === "/rest/api/2/issue",
          );
          if (createUpdate?.body?.fields) {
            await api.request("PUT", `/rest/api/2/issue/${issue.key}`, {
              fields: createUpdate.body.fields,
            });
          }
          return issue.key;
        }
      }
    }

    // No existing ticket found — create one.
    const createUpdate = updates.find(
      (u) => u.method === "POST" && u.path === "/rest/api/2/issue",
    );
    if (!createUpdate)
      throw new Error(
        "XXXX file has no POST /rest/api/2/issue entry in updates",
      );
    const data = await api.request(
      "POST",
      "/rest/api/2/issue",
      createUpdate.body,
    );
    return data.key ?? "PDCL-XXXX";
  }

  const ticketKey = await resolveKey();

  if (!hasUpdates) return ticketKey;

  const isCreateCall = (u) =>
    isNewTicket && u.method === "POST" && u.path === "/rest/api/2/issue";

  for (const update of updates) {
    if (isCreateCall(update)) continue;
    const path = String(update.path).replace(/\{key\}/g, ticketKey);
    const body = interpolate(update.body, vars);
    await api.request(update.method, path, body);
  }

  return ticketKey;
}

// Script entry point — only executes when run directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rawArgs = process.argv.slice(2);
  const dryRun = rawArgs.includes("--dry-run");
  const args = rawArgs.filter((a) => a !== "--dry-run");

  if (args.length < 1) {
    console.error("Usage: apply.js [--dry-run] <filename>");
    process.exit(1);
  }

  const [filename] = args;

  const parsed = (() => {
    try {
      return yamlLoad(readFileSync(filename, "utf8")) ?? {};
    } catch {
      return {};
    }
  })();
  const hasUpdates = Array.isArray(parsed.updates) && parsed.updates.length > 0;

  if (hasUpdates) {
    if (!JIRA_API_TOKEN) {
      console.error("JIRA_API_TOKEN is required");
      process.exit(1);
    }
    if (!dryRun) {
      if (!process.env.GITHUB_PR_URL) {
        console.error("GITHUB_PR_URL is required when updates are present");
        process.exit(1);
      }
      if (!process.env.GITHUB_PR_TITLE) {
        console.error("GITHUB_PR_TITLE is required when updates are present");
        process.exit(1);
      }
    }
  }

  const api = createApi({
    dryRun,
    baseUrl: JIRA_BASE_URL.replace(/\/$/, ""),
    token: JIRA_API_TOKEN ?? "",
  });

  applyFile(filename, {
    api,
    prUrl: process.env.GITHUB_PR_URL ?? "",
    prTitle: process.env.GITHUB_PR_TITLE ?? "",
  })
    .then((key) => console.log(key))
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
