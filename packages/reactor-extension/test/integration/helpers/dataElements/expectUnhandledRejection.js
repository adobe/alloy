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

import { onTestFinished } from "vitest";

// Listens for an expected unhandled rejection so it doesn't fail the run.
// Call inside a test, then assert `seen()` after the triggering action.
export const expectUnhandledRejection = (matches) => {
  let seen = false;
  const handler = (event) => {
    if (matches(event.reason)) {
      event.preventDefault();
      seen = true;
    }
  };
  // The test runner re-logs the rejection event via console.error; drop only
  // that event (filtered like helpers/errorSuppression.js) so setup.js's
  // console-error guard still catches anything else.
  const previousConsoleError = console.error;
  console.error = (...args) => {
    const isExpected = args.some(
      (arg) => arg instanceof PromiseRejectionEvent && matches(arg.reason),
    );
    if (!isExpected) {
      previousConsoleError.apply(console, args);
    }
  };
  window.addEventListener("unhandledrejection", handler, true);
  onTestFinished(() => {
    window.removeEventListener("unhandledrejection", handler, true);
    console.error = previousConsoleError;
  });
  return () => seen;
};
