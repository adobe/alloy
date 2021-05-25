/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { REDIRECT_PAGE_WIDE_SCOPE_DECISION } from "./responsesMock/eventResponses";
import createRedirectHandler from "../../../../../src/components/Personalization/createRedirectHandler";

describe("Personalization::createRedirectDecisionHandler", () => {
  let collect;
  let showContainers;
  let logger;

  const documentMayUnload = true;
  const decisions = REDIRECT_PAGE_WIDE_SCOPE_DECISION;
  const decisionsMeta = [
    {
      id: decisions[0].id,
      scope: decisions[0].scope
    }
  ];
  const replace = jasmine.createSpy();

  const window = {
    location: { replace }
  };

  beforeEach(() => {
    collect = jasmine.createSpy().and.returnValue(Promise.resolve());
    logger = jasmine.createSpyObj("logger", ["warn"]);
    showContainers = jasmine.createSpy("showContainers");
  });

  it("should trigger collect before redirect", () => {
    const handleRedirectDecisions = createRedirectHandler({
      collect,
      window,
      logger,
      showContainers
    });
    return handleRedirectDecisions(decisions).then(() => {
      expect(collect).toHaveBeenCalledWith({
        decisionsMeta,
        documentMayUnload
      });
      expect(replace).toHaveBeenCalledWith(decisions[0].items[0].data.content);
    });
  });
  it("should trigger showContainers and logger when redirect fails", () => {
    replace.and.throwError("Malformed url");

    const handleRedirectDecisions = createRedirectHandler({
      collect,
      window,
      logger,
      showContainers
    });
    return handleRedirectDecisions(decisions).then(() => {
      expect(collect).toHaveBeenCalledWith({
        decisionsMeta,
        documentMayUnload
      });
      expect(showContainers).toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalled();
    });
  });
});
