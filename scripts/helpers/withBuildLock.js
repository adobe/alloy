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
import path from "path";
import { fileURLToPath } from "url";

const LOCK_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../node_modules/.cache/alloy-build.lock",
);
const OWNER_FILE = path.join(LOCK_DIR, "pid");
const POLL_MS = 250;
const TIMEOUT_MS = 10 * 60 * 1000;

const isAlive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === "EPERM";
  }
};

const tryAcquire = () => {
  try {
    fs.mkdirSync(LOCK_DIR);
    fs.writeFileSync(OWNER_FILE, String(process.pid));
    return true;
  } catch (e) {
    if (e.code !== "EEXIST") {
      throw e;
    }
  }
  // Drop a lock left behind by a process that was killed while holding it.
  let owner;
  try {
    owner = Number(fs.readFileSync(OWNER_FILE, "utf8"));
  } catch {
    // The owner may not have written its pid yet.
    return false;
  }
  if (owner && !isAlive(owner)) {
    fs.rmSync(LOCK_DIR, { recursive: true, force: true });
  }
  return false;
};

/**
 * Runs fn while holding a lock shared by every process in this checkout.
 * Packing and building rewrite shared output such as packages/core/dist, so
 * two concurrent test runs would otherwise delete each other's files.
 * @template T
 * @param {() => T | Promise<T>} fn
 * @returns {Promise<T>}
 */
export default async (fn) => {
  fs.mkdirSync(path.dirname(LOCK_DIR), { recursive: true });
  const deadline = Date.now() + TIMEOUT_MS;
  while (!tryAcquire()) {
    if (Date.now() > deadline) {
      throw new Error(`Timed out waiting for build lock at ${LOCK_DIR}`);
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => {
      setTimeout(resolve, POLL_MS);
    });
  }
  try {
    return await fn();
  } finally {
    fs.rmSync(LOCK_DIR, { recursive: true, force: true });
  }
};
