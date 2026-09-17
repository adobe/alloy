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
import useView from "../../integration/helpers/useView";
import UpdateVariableView from "../../../src/view/actions/updateVariableView";
import { worker } from "../../integration/helpers/mocks/browser";
import {
  singleSchemaHandlers,
  schemaDetailsHandlers,
} from "../../integration/helpers/mocks/defaultHandlers";
import extensionSettings from "../helpers/allComponentsSettings";
import captureView from "../helpers/captureView";

let cleanup;
afterEach(() => cleanup?.());

it("renders", async () => {
  // The existing variable data element list isn't covered by the default MSW
  // handlers (every consuming integration spec opts in explicitly). The
  // delegate_descriptor_id must match fetchDataElements.js's
  // `__EXTENSION_NAME__::dataElements::variable` literally: the
  // babel-plugin-version macro that replaces `__EXTENSION_NAME__` only runs
  // at package time, not under vitest.
  worker.use(...singleSchemaHandlers, ...schemaDetailsHandlers);
  worker.use(
    http.get(
      "https://reactor.adobe.io/properties/PR1234/data_elements",
      async () =>
        HttpResponse.json({
          data: [
            {
              id: "DE1",
              attributes: {
                name: "Test XDM Variable",
                delegate_descriptor_id:
                  "__EXTENSION_NAME__::dataElements::variable",
                settings: JSON.stringify({
                  sandbox: { name: "prod" },
                  schema: {
                    id: "https://ns.adobe.com/test/schemas/sch123",
                    version: "1.0",
                  },
                }),
              },
            },
          ],
          meta: {
            pagination: {
              current_page: 1,
              next_page: null,
              prev_page: null,
              total_pages: 1,
              total_count: 1,
            },
          },
        }),
    ),
  );

  const { driver, cleanup: viewCleanup } = await useView(UpdateVariableView);
  cleanup = viewCleanup;
  await driver.init({ extensionSettings });
  await captureView("actions__updateVariable.png");
});
