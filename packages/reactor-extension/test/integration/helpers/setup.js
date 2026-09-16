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

import { beforeAll, afterEach, afterAll } from "vitest";
import { worker } from "./mocks/browser";
import "./spectrumLocators";
import { wrappedConsoleError, resetErrorSuppression } from "./errorSuppression";
import field from "./field";

// React (dev) logs to console when an error boundary catches an error. In Vitest browser
// mode, onConsoleLog in the config has no effect (logs stay in the browser). Override
// here so we suppress only that message in test output; it still appears in a real browser.
console.error = wrappedConsoleError;

beforeAll(async () => {
  await worker.start({
    onUnhandledRequest: "bypass",
    quiet: true,
  });
});

// Some components from react-specturm rely on process.env to exists.
// VIRT_ON is used to determine if we are in a test environment for selects and comboboxes.
window.process = {
  env: {
    VIRT_ON: true,
  },
};

// React Spectrum overlays (Picker/Menu/Popover) open and close on react-transition-group
// fixed setTimeouts (OpenTransition timeout={{enter:0, exit:350}}) plus CSS transitions. Under
// the coverage job's CPU contention those real-timer animations stall for seconds, so overlay
// assertions (visibility, click actionability) miss their poll windows and heavy tests
// intermittently exceed the 30s timeout. Zeroing transition/animation durations removes that
// nondeterministic latency in the test environment only.
const disableAnimations = document.createElement("style");
disableAnimations.textContent =
  "*, *::before, *::after { transition-duration: 0ms !important; animation-duration: 0ms !important; transition-delay: 0ms !important; animation-delay: 0ms !important; }";
document.head.appendChild(disableAnimations);

// Reset handlers after each test (important for test isolation)
afterEach(() => {
  worker.resetHandlers();
  resetErrorSuppression();
});

// Clean up after all tests
afterAll(() => {
  worker.stop();
  if (import.meta.env.VITE_DEBUG_RETRIES === "true") {
    field.logTotalRetries();
  }
});
