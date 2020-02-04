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

  it("expects getDecisions to return empty array since for default scopes we don't have any decision stored", () => {
    const isViewStart = true;
    const scopes = [];

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
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });

    const result = personalization.commands.getDecisions({ scopes });

    expect(result).toEqual([]);
  });

  // expects to return decisions only for Foo1 scope
  it("expects getDecisions to return a decision since we have stored in memory only one that matches ", () => {
    const isViewStart = true;
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
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });

    const result = personalization.commands.getDecisions({ scopes });

    expect(result.length).toEqual(1);
    expect(result[0].scope).toEqual("Foo1");
  });

  // expects getDecisions to return decisions only for Foo1 and Foo3 scopes
  it("expects getDecisions to return multiple decisions for multiple scopes when not overwritten by later response", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3"];

    const responseFirstEvent = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO3_DECISIONS;
      }
    };
    const responseSecondEvent = {
      getPayloadsByType() {
        return SCOPES_FOO4_FOO5_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response: responseFirstEvent });
    personalization.lifecycle.onResponse({ response: responseSecondEvent });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(2);
  });

  it("expects getDecisions to return the most recent decision for the scope that was overwritten by the last response", () => {
    const isViewStart = true;
    const scopes = ["Foo1"];

    const responseFirstEvent = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO2_DECISIONS;
      }
    };
    const responseSecondEvent = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO3_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response: responseFirstEvent });
    personalization.lifecycle.onResponse({ response: responseSecondEvent });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual("TNT:ABC:ABC1");
    expect(result[0].scope).toEqual(scopes[0]);
  });

  it("expects getDecisions to return empty array when it is invoked for specific scope but in memory we have stored only PAGE_WIDE_SCOPE decisions", () => {
    const isViewStart = true;
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
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });
    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(0);
  });

  it("expects getDecisions to return the default scope decisions when only parameter viewStart is passed", () => {
    const isViewStart = true;
    const scopes = [];

    const response = {
      getPayloadsByType() {
        return NO_SCOPES_DECISIONS;
      }
    };
    const responseSecondEvent = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO3_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });
    personalization.lifecycle.onResponse({ response: responseSecondEvent });

    const result = personalization.commands.getDecisions({ viewStart: true });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual("TNT:activity1:experience1");
  });

  it("expects getDecisions to return the default and specified scope decisions when parameter viewStart and scopes is passed", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3"];

    const response = {
      getPayloadsByType() {
        return NO_SCOPES_DECISIONS;
      }
    };
    const responseSecondEvent = {
      getPayloadsByType() {
        return SCOPES_FOO1_FOO3_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });
    personalization.lifecycle.onResponse({ response: responseSecondEvent });

    const result = personalization.commands.getDecisions({
      viewStart: true,
      scopes
    });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(3);
  });

  it("expects getDecisions to return empty array if event didn't get any decision", () => {
    const isViewStart = true;
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
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });
    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(0);
  });

  it("expects getDecisions to return all decisions for the scope stored during multiple responses", () => {
    const isViewStart = true;
    const scopes = ["Foo5"];

    const response = {
      getPayloadsByType() {
        return NO_SCOPES_DECISIONS;
      }
    };
    const responseSecondEvent = {
      getPayloadsByType() {
        return SAME_SCOPE_MULTIPLE_DECISIONS;
      }
    };
    const personalization = createPersonalization({
      config,
      logger,
      eventManager
    });
    personalization.lifecycle.onBeforeEvent({ event, isViewStart, scopes });
    personalization.lifecycle.onResponse({ response });
    personalization.lifecycle.onResponse({ response: responseSecondEvent });

    const result = personalization.commands.getDecisions({ scopes });

    expect(Array.isArray(result)).toBeTrue();
    expect(result.length).toEqual(2);
    expect(result[0].id).toEqual("TNT:ABC:A4");
    expect(result[1].id).toEqual("TNT:ABC:A5");
  });
});
