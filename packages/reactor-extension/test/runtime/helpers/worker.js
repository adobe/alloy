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

import { http, HttpResponse, passthrough } from "msw";
import { setupWorker } from "msw/browser";

// Cross-origin requests that no test handler answered. Tests fail in afterEach
// if this is non-empty, so they can never depend on a real Edge.
export const unexpectedRequests = [];

// Initial handlers have the lowest priority and survive resetHandlers(), so
// this catch-all only sees requests no test handler matched. Same-origin
// requests (the Vite dev server) pass through.
const catchAll = http.all(/.*/, ({ request }) => {
  if (new URL(request.url).origin === window.location.origin) {
    return passthrough();
  }
  unexpectedRequests.push(`${request.method} ${request.url}`);
  return HttpResponse.error();
});

export const worker = setupWorker(catchAll);
