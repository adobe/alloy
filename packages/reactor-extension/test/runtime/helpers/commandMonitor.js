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

import { expect } from "vitest";

let started = 0;
let settled = 0;
let rejected = [];

// Alloy reads window.__alloyMonitors on every log call, so a monitor pushed
// before the library is evaluated sees every command the rules run.
export const monitor = {
  onBeforeCommand() {
    started += 1;
  },
  onCommandResolved() {
    settled += 1;
  },
  onCommandRejected({ commandName, error }) {
    settled += 1;
    rejected.push(`${commandName}: ${error?.message ?? error}`);
  },
};

export const resetCommandMonitor = () => {
  started = 0;
  settled = 0;
  rejected = [];
};

export const getRejectedCommands = () => [...rejected];

/**
 * Resolves once every Alloy command started by the page has resolved or
 * rejected, so a test never tears down mocks under a command that is still
 * running.
 */
export const waitForCommandsToSettle = () =>
  expect.poll(() => started - settled, { timeout: 10_000 }).toBe(0);
