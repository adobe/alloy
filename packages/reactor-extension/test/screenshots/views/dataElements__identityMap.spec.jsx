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

import { afterEach, it } from "vitest";
import { http, HttpResponse } from "msw";
import useEntryModule from "../helpers/useEntryModule";
import { worker } from "../../integration/helpers/mocks/browser";
import extensionSettings from "../helpers/allComponentsSettings";
import captureView from "../helpers/captureView";

let cleanup;
afterEach(() => cleanup?.());

it("renders", async () => {
  // The identity namespaces list isn't covered by the default MSW handlers
  // (fetchNamespaces swallows failures and falls back to an empty list, but
  // mocking it gives a deterministic, non-empty baseline).
  worker.use(
    http.get(
      "https://platform.adobe.io/data/core/idnamespace/identities",
      async () =>
        HttpResponse.json([
          { code: "Email", name: "Email" },
          { code: "Phone", name: "Phone Number" },
        ]),
    ),
  );

  const { driver, cleanup: viewCleanup } = await useEntryModule(
    () => import("../../../src/view/dataElements/identityMap.jsx"),
  );
  cleanup = viewCleanup;
  await driver.init({ extensionSettings });
  await captureView("dataElements__identityMap.png");
});
