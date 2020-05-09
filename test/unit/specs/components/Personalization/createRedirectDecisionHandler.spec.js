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

import { REDIRECT_PAGE_WIDE_SCOPE_DECISION } from "./responsesMock/eventResponses";
import createRedirectDecisionHandler from "../../../../../src/components/Personalization/createRedirectDecisionHandler";

describe("Personalization::createRedirectDecisionHandler", () => {
  let collect;

  const decisions = REDIRECT_PAGE_WIDE_SCOPE_DECISION;
  const metas = [
    {
      id: decisions[0].id,
      scope: decisions[0].scope
    }
  ];
  const replace = jasmine.createSpy();

  beforeEach(() => {
    collect = jasmine.createSpy().and.returnValue(Promise.resolve());
  });

  it("should trigger collect before redirect", () => {
    const win = {
      location: { replace }
    };
    const handleRedirectDecisions = createRedirectDecisionHandler({
      collect,
      win
    });
    return handleRedirectDecisions(decisions).then(() => {
      expect(collect).toHaveBeenCalledWith({ decisions: metas }, true);
      expect(replace).toHaveBeenCalledWith(decisions[0].items[0].data.content);
    });
  });
});
