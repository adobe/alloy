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

import createExecuteDecisions from "../../../../../src/components/Personalization/createExecuteDecisions";

describe("Personalization::createExecuteDecisions", () => {
  let handleRedirectDecisions;
  let handleDomActionDecisions;
  let showContainers;

  beforeEach(() => {
    showContainers = jasmine.createSpy();
    handleRedirectDecisions = jasmine.createSpy();
    handleDomActionDecisions = jasmine.createSpy();
  });

  it("should trigger redirectDecisionHandler when provided with an array of redirect decisions", () => {
    const redirectDecisions = [
      {
        id: "foo"
      }
    ];
    const renderableDecisions = [];
    const executeDecisions = createExecuteDecisions({
      showContainers,
      handleRedirectDecisions,
      handleDomActionDecisions
    });

    executeDecisions({ redirectDecisions, renderableDecisions });

    expect(handleRedirectDecisions).toHaveBeenCalledWith(redirectDecisions);
    expect(handleDomActionDecisions).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
  });

  it("should trigger domActionDecisionHandler when provided with an array of renderable decisions", () => {
    const redirectDecisions = [];
    const renderableDecisions = [
      {
        id: "foo"
      }
    ];
    const executeDecisions = createExecuteDecisions({
      showContainers,
      handleRedirectDecisions,
      handleDomActionDecisions
    });

    executeDecisions({ redirectDecisions, renderableDecisions });

    expect(handleRedirectDecisions).not.toHaveBeenCalled();
    expect(handleDomActionDecisions).toHaveBeenCalledWith(renderableDecisions);
    expect(showContainers).toHaveBeenCalled();
  });
});
