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

import createPersonalization from "../../../../../src/components/Personalization";
import createConfig from "../../../../../src/core/config/createConfig";
import {
  NO_SCOPES_DECISIONS,
  SAME_SCOPE_MULTIPLE_DECISIONS,
  SCOPES_FOO1_FOO2_DECISIONS,
  SCOPES_FOO1_FOO3_DECISIONS,
  SCOPES_FOO4_FOO5_DECISIONS
} from "./responsesMock/eventResponses";

describe("Personalization", () => {
  let event;
  const config = createConfig({ prehidingStyle: "" });

  const logger = {
    log() {},
    warn() {}
  };

  const payload = {
    mergeConfigOverrides() {}
  };

  const eventManager = {
    createEvent() {},
    sendEvent() {}
  };

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["expectResponse", "mergeQuery"]);
  });

  it("expects a response if event is a view start", () => {
    const isViewStart = true;
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    personalization.lifecycle.onBeforeEvent({ event, isViewStart, payload });

    expect(event.expectResponse).toHaveBeenCalled();
  });

  it("does not expect a response if event is not a view start", () => {
    const isViewStart = false;
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    personalization.lifecycle.onBeforeEvent({ event, isViewStart, payload });

    expect(event.expectResponse).not.toHaveBeenCalled();
  });

  it("expects getDecisions to return an array of decisions for the scopes provided", () => {
    const scopes = ["Foo1", "Foo3"];
    const response = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO2_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    personalization.lifecycle.onResponse({ response });

    const result = personalization.commands.getDecisions({ scopes });

    expect(result.length).toEqual(1);
    expect(result[0].scope).toEqual("Foo1");
  });

  it("expects getDecisions to return decisions for multiple scopes when storage is not overwritten by latest response", () => {
    const scopes = ["Foo1", "Foo3"];

    const first = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO3_DECISIONS;
      }
    };
    const second = {
      getPayloadsByType() {
        return SCOPES_FOO4_FOO5_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onResponse({ response: first });
    personalization.lifecycle.onResponse({ response: second });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(2);
  });

  it("expects getDecisions to return the most recent decision for the scope that was overwritten by the last response", () => {
    const scopes = ["Foo1"];
    const first = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO2_DECISIONS;
      }
    };
    const second = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO3_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    personalization.lifecycle.onResponse({ response: first });
    personalization.lifecycle.onResponse({ response: second });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual("TNT:ABC:ABC1");
    expect(result[0].scope).toEqual(scopes[0]);
  });

  it("expects getDecisions to return empty array when there are no decisions for that specific scope in the storage", () => {
    const scopes = ["Foo1", "Foo3"];
    const response = {
      getPayloadsByType() {
        return NO_SCOPES_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onResponse({ response });
    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(0);
  });

  it("expects getDecisions to return empty array if the storage is empty", () => {
    const scopes = ["Foo1", "Foo3"];

    const response = {
      getPayloadsByType() {
        return [];
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    personalization.lifecycle.onResponse({ response });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(0);
  });

  it("expects getDecisions to return all decisions for a specific scope stored during multiple responses", () => {
    const scopes = ["Foo5"];
    const first = {
      getPayloadsByType() {
        return NO_SCOPES_DECISIONS;
      }
    };
    const second = {
      getPayloadsByType() {
        return SAME_SCOPE_MULTIPLE_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    personalization.lifecycle.onResponse({ response: first });
    personalization.lifecycle.onResponse({ response: second });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(2);
    expect(result[0].id).toEqual("TNT:ABC:A4");
    expect(result[1].id).toEqual("TNT:ABC:A5");
  });

  it("expects getDecisions to throw an error when options is missing", () => {
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });

    expect(() => personalization.commands.getDecisions()).toThrow();
  });
});
