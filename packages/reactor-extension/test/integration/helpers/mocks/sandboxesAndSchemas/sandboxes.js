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

import { http, HttpResponse } from "msw";

const SANDBOXES_URL =
  "https://platform.adobe.io/data/foundation/sandbox-management/";

const sandbox = (name, title, isDefault = false) => ({
  name,
  title,
  type: "production",
  isDefault,
  region: "VA7",
  state: "active",
});

const respondWith = (sandboxes) => [
  http.get(SANDBOXES_URL, () => HttpResponse.json({ sandboxes })),
];

export const sandboxSingleWithoutDefaultHandlers = respondWith([
  sandbox("testsandbox1", "Test Sandbox 1"),
]);

export const sandboxMultipleWithDefaultHandlers = respondWith([
  sandbox("testsandbox1", "Test Sandbox 1"),
  sandbox("testsandbox2", "Test Sandbox 2", true),
  sandbox("testsandbox3", "Test Sandbox 3"),
  sandbox("prod", "Test Sandbox Prod"),
]);

export const sandboxMultipleWithoutDefaultHandlers = respondWith([
  sandbox("testsandbox1", "Test Sandbox 1"),
  sandbox("testsandbox2", "Test Sandbox 2"),
  sandbox("testsandbox3", "Test Sandbox 3"),
  sandbox("prod", "Test Sandbox Prod"),
]);

export const sandboxNonJsonBodyHandlers = [
  http.get(SANDBOXES_URL, () => new HttpResponse("non-json body")),
];

export const sandboxUserRegionMissing403Handlers = [
  http.get(SANDBOXES_URL, () =>
    HttpResponse.json(
      { error_code: "403027", message: "User region is missing" },
      { status: 403 },
    ),
  ),
];
