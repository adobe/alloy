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

import {
  PAGE_WIDE_SCOPE_DECISIONS,
  SCOPES_FOO1_FOO2_DECISIONS,
  PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS,
  PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
} from "./responsesMock/eventResponses";
import extractDecisions from "../../../../../src/components/Personalization/extractRenderableDecisions";

describe("Personalization::extractDecisions", () => {
  const response = PAGE_WIDE_SCOPE_DECISIONS.concat(SCOPES_FOO1_FOO2_DECISIONS);

  it("extracts dom action decisions and rest of decisions", () => {
    const [domActionDecisions, decisions] = extractDecisions(response);
    expect(decisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS.concat(
        SCOPES_FOO1_FOO2_DECISIONS
      )
    );
    expect(domActionDecisions).toEqual(
      PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS
    );
  });
});
