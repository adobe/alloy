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

import { afterEach, beforeEach } from "vitest";

/**
 * Opens a fresh copy of an action view before each test of the enclosing
 * describe and cleans it up afterwards. The returned object is filled in by
 * the time a test runs: { view, driver, cleanup }.
 *
 * @param {() => Promise<{ view, driver, cleanup }>} openView
 */
export default function setUpView(openView) {
  const opened = {};
  beforeEach(async () => {
    Object.assign(opened, await openView());
  });
  afterEach(() => opened.cleanup());
  return opened;
}
