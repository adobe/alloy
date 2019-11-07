/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createComponent from "../../../../../src/components/Context/createComponent";

describe("Context::createComponent", () => {
  const logger = {
    log() {},
    warn() {}
  };
  const context1 = xdm => {
    xdm.a = "1";
  };
  const context2 = xdm => {
    xdm.b = "2";
  };
  const requiredContext = xdm => {
    xdm.c = "3";
  };
  const availableContexts = { context1, context2 };
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeXdm"]);
  });

  it("enables the configured contexts", () => {
    const config = { context: ["context1", "context2"] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ a: "1", b: "2", c: "3" });
  });
  it("ignores unknown contexts", () => {
    const config = { context: ["unknowncontext", "context1"] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ a: "1", c: "3" });
  });

  it("can disable non-required contexts", () => {
    const config = { context: [] };
    const component = createComponent(config, logger, availableContexts, [
      requiredContext
    ]);
    component.lifecycle.onBeforeEvent({ event });

    expect(event.mergeXdm).toHaveBeenCalledWith({ c: "3" });
  });
});
