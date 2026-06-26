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

import { readFileSync, unlinkSync, existsSync } from "fs";
import { basename, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import createApi from "./api.mjs";
import { applyFile } from "./apply.mjs";
import { fetchFile } from "./fetch.mjs";
import { JIRA_BASE_URL, JIRA_API_TOKEN } from "../team/config.js";

/**
 * Process a single .jira/*.yml file: apply updates, refresh details via fetch.
 * For XXXX files, deletes the placeholder file and creates a real-key file.
 * @param {string} filename
 * @param {{ api: object, prUrl?: string, prTitle?: string }} opts
 * @returns {Promise<string|null>} ticket key if processed, null if skipped
 */
export async function processFile(filename, { api, prUrl = "", prTitle = "" }) {
  if (!existsSync(filename)) {
    console.log(`Skipping ${filename} (file not found)`);
    return null;
  }

  const parsed = yaml.load(readFileSync(filename, "utf8")) ?? {};
  const hasUpdates = Array.isArray(parsed.updates) && parsed.updates.length > 0;

  if (!hasUpdates) {
    console.log(`Skipping ${filename} (no updates)`);
    return null;
  }

  const ticketKey = await applyFile(filename, { api, prUrl, prTitle });
  console.log(`Applied: ${ticketKey}`);

  // Derive new filename: replace XXXX with the real ticket number.
  const dir = dirname(filename);
  const base = basename(filename);
  const ticketNum = ticketKey.split("-").pop();
  const newBase = base.replace("XXXX", ticketNum);
  const newFilename = `${dir}/${newBase}`;

  if (filename !== newFilename && !api.dryRun) {
    unlinkSync(filename);
  }

  await fetchFile(ticketKey, newFilename, { api });

  return ticketKey;
}

// Script entry point — only executes when run directly.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const rawArgs = process.argv.slice(2);
  const dryRun = rawArgs.includes("--dry-run");
  const args = rawArgs.filter((a) => a !== "--dry-run");

  if (args.length < 1) {
    console.error("Usage: process.mjs [--dry-run] <filename>");
    process.exit(1);
  }

  const [filename] = args;

  if (!dryRun) {
    if (!JIRA_API_TOKEN) {
      console.error("JIRA_API_TOKEN is required");
      process.exit(1);
    }
    if (!process.env.GITHUB_PR_URL) {
      console.error("GITHUB_PR_URL is required");
      process.exit(1);
    }
    if (!process.env.GITHUB_PR_TITLE) {
      console.error("GITHUB_PR_TITLE is required");
      process.exit(1);
    }
  }

  const api = createApi({
    dryRun,
    baseUrl: JIRA_BASE_URL.replace(/\/$/, ""),
    token: JIRA_API_TOKEN ?? "",
  });

  processFile(filename, {
    api,
    prUrl: process.env.GITHUB_PR_URL ?? "",
    prTitle: process.env.GITHUB_PR_TITLE ?? "",
  })
    .then((key) => {
      if (key) console.log(key);
    })
    .catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}
