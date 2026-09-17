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
import useView from "../../integration/helpers/useView";
import VariableView from "../../../src/view/dataElements/variableView";
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
  // The XDM variable subform fetches sandboxes/schemas; the schema registry
  // isn't covered by the default MSW handlers.
  worker.use(...singleSchemaHandlers, ...schemaDetailsHandlers);

  const { driver, cleanup: viewCleanup } = await useView(VariableView);
  cleanup = viewCleanup;
  await driver.init({ extensionSettings });
  await captureView("dataElements__variable.png");
});
