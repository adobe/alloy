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

import { afterAll, afterEach, beforeAll, beforeEach, expect, vi } from "vitest";
import {
  getRejectedCommands,
  resetCommandMonitor,
  waitForCommandsToSettle,
} from "./commandMonitor.js";
import { unexpectedRequests, worker } from "./worker.js";

// Requests MSW has seen start but not finish, keyed by id. Reset per attempt
// so one that never settles (a handler that threw, a blocked request) can't
// carry over into a retry.
const pendingRequests = new Set();
let documentBaseline = new Set();
let listeners = [];
const restoreListenerPatches = [];

const pageNodes = () => [...document.head.children, ...document.body.children];

// Turbine and Alloy register document/window listeners with no teardown API
// (e.g. ActivityCollector's capturing click listener), so record every
// listener added during a test and remove it afterwards.
const trackListeners = (target) => {
  const originalAdd = target.addEventListener;
  target.addEventListener = function addEventListener(type, listener, options) {
    listeners.push([target, type, listener, options]);
    return originalAdd.call(this, type, listener, options);
  };
  restoreListenerPatches.push(() => {
    // The original lives on EventTarget.prototype.
    delete target.addEventListener;
  });
};

const removeTrackedListeners = () => {
  restoreListenerPatches.splice(0).forEach((restore) => restore());
  listeners.forEach(([target, type, listener, options]) => {
    target.removeEventListener(type, listener, options);
  });
  listeners = [];
};

const clearCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const name = cookie.split("=")[0].trim();
    if (name) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
  });
};

const resetPage = () => {
  // Everything a test or the library added to <head>/<body>: injected scripts,
  // fixture HTML, Alloy's prehiding style.
  pageNodes().forEach((node) => {
    if (!documentBaseline.has(node)) {
      node.remove();
    }
  });
  [
    "_satellite",
    "__satelliteLoaded",
    "responseBody",
    "Visitor",
    "alloy",
    "__alloyNS",
    "__alloyMonitors",
  ].forEach((name) => {
    delete window[name];
  });
  clearCookies();
  window.localStorage.clear();
  window.sessionStorage.clear();
  resetCommandMonitor();
};

beforeAll(async () => {
  const start = ({ requestId }) => pendingRequests.add(requestId);
  const settle = ({ requestId }) => pendingRequests.delete(requestId);
  worker.events.on("request:start", start);
  [
    "request:end",
    "response:mocked",
    "response:bypass",
    "unhandledException",
  ].forEach((event) => {
    worker.events.on(event, settle);
  });
  await worker.start({ quiet: true, onUnhandledRequest: "bypass" });
});

beforeEach(() => {
  pendingRequests.clear();
  unexpectedRequests.length = 0;
  documentBaseline = new Set(pageNodes());
  resetPage();
  trackListeners(document);
  trackListeners(window);
});

afterEach(async () => {
  const problems = [];
  try {
    // Tear down mocks and page state only after the rules have finished
    // running their commands and every request has been answered.
    await waitForCommandsToSettle();
    await expect.poll(() => pendingRequests.size, { timeout: 10_000 }).toBe(0);
  } catch (error) {
    problems.push(`Test left work running: ${error.message}`);
  }
  problems.push(
    ...getRejectedCommands().map(
      (command) => `Alloy command rejected: ${command}`,
    ),
  );
  if (unexpectedRequests.length > 0) {
    problems.push(
      `Unmocked external requests: ${unexpectedRequests.join(", ")}`,
    );
  }
  removeTrackedListeners();
  worker.resetHandlers();
  vi.restoreAllMocks();
  resetPage();
  if (problems.length > 0) {
    throw new Error(problems.join("\n"));
  }
});

afterAll(() => {
  worker.stop();
});
