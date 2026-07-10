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

import { server } from "vitest/browser";

const { readFile } = server.commands;

export default async () => {
  const alloyBaseCode = await readFile(
    `${server.config.root}/packages/browser/distTest/baseCode.min.js`,
  );

  document.body.innerHTML = "Alloy Test Page";

  // Monkeypatch document.addEventListener once per page lifetime to track click listeners.
  // Paired with helpers/alloy/clean.js, which removes stale alloy click listeners between
  // tests to prevent cross-test leakage. The patch is intentionally permanent (never restored)
  // and only tracks "click" events — all other event types are passed through untouched.
  if (!window.__alloyClickListeners) {
    window.__alloyClickListeners = [];
    const originalAddEventListener = document.addEventListener.bind(document);
    document.addEventListener = (type, handler, ...rest) => {
      if (type === "click") {
        window.__alloyClickListeners.push({ handler, rest });
      }
      return originalAddEventListener(type, handler, ...rest);
    };
  }

  const alloyBaseCodeScriptTag = document.createElement("script");
  alloyBaseCodeScriptTag.textContent = alloyBaseCode;

  document.body.appendChild(alloyBaseCodeScriptTag);
};
