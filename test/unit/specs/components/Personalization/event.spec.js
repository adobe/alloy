/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { createQueryDetails } from "../../../../../src/components/Personalization/event";
import {
  DOM_ACTION,
  JSON_CONTENT_ITEM,
  REDIRECT_ITEM,
  HTML_CONTENT_ITEM
} from "../../../../../src/components/Personalization/constants/schema";

describe("Personalization::event", () => {
  it("create query details for all schemas", () => {
    const decisionScopes = ["__view__", "foo"];
    const result = createQueryDetails(decisionScopes);
    const expectedSchemas = [
      HTML_CONTENT_ITEM,
      JSON_CONTENT_ITEM,
      REDIRECT_ITEM,
      DOM_ACTION
    ];
    expect(result).toEqual({ schemas: expectedSchemas, decisionScopes });
  });
  it("create query details without dom action schema", () => {
    const decisionScopes = ["foo"];
    const result = createQueryDetails(decisionScopes);
    const expectedSchemas = [
      HTML_CONTENT_ITEM,
      JSON_CONTENT_ITEM,
      REDIRECT_ITEM
    ];
    expect(result).toEqual({ schemas: expectedSchemas, decisionScopes });
  });
});
