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

import XdmObjectView from "../../../../src/view/dataElements/xdmObjectView";
import useView from "../useView";
import field from "../field";
import { worker } from "../mocks/browser";
import { createObjectEditor } from "../objectEditor";
import {
  richSchemaHandlers,
  xdmTestsSettings,
} from "../mocks/xdmObjectDataElementTests/handlers";
import {
  ANALYTICS_MIGRATION_SCHEMA_TITLE,
  XDM_TESTS_SCHEMA_TITLE,
} from "../mocks/xdmObjectDataElementTests/schemas";

/**
 * Renders the XDM object view against the rich schemas. With `data`, the view
 * is initialized with the XDM Object Data Element Tests schema already saved.
 * Without it, the view starts empty and tests pick a schema with
 * `selectSchema`.
 */
export default async ({ data } = {}) => {
  worker.use(...richSchemaHandlers);
  const { view, driver, cleanup } = await useView(XdmObjectView);
  await driver.init(data ? { settings: { ...xdmTestsSettings, data } } : {});
  const selectSchema = (title = XDM_TESTS_SCHEMA_TITLE) =>
    field(view.getByTestId("schemaField")).selectOption(title);
  return {
    view,
    driver,
    cleanup,
    editor: createObjectEditor(view),
    selectSchema,
    selectAnalyticsMigrationSchema: () =>
      selectSchema(ANALYTICS_MIGRATION_SCHEMA_TITLE),
  };
};
