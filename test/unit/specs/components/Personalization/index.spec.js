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
  SCOPES_DECISIONS,
  SCOPES_DECISIONS_2,
  SCOPES_DECISIONS_3
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

  it("expects to not return any decision since for default scopes we don't have any decision stored", () => {
    const isViewStart = true;
    const scopes = [];

    const response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    response.getPayloadsByType.and.returnValue(SCOPES_DECISIONS);

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
  it("expects getDecision to return a decision", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3"];

    const response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    response.getPayloadsByType.and.returnValue(SCOPES_DECISIONS);

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
  it("expects getDecision to return an array of 2 decisions", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3"];

    const responseFirstEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseFirstEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS_2);

    const responseSecondEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseSecondEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS_3);
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

  it("expects getDecisions to return decisions for all Foo1, Foo3, Foo4, Foo5 scopes", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3", "Foo4", "Foo5"];

    const responseFirstEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseFirstEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS_2);

    const responseSecondEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseSecondEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS_3);
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
    expect(result.length).toEqual(4);
  });

  it("expects getDecision to return the most recent decision for Foo1 scope", () => {
    const isViewStart = true;
    const scopes = ["Foo1"];

    const responseFirstEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseFirstEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS);

    const responseSecondEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseSecondEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS_2);
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

  it("expects getDecision to return empty array", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3"];

    const response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    response.getPayloadsByType.and.returnValue(NO_SCOPES_DECISIONS);
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

  it("expects getDecision to return the default scope decisions", () => {
    const isViewStart = true;
    const scopes = [];

    const response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    response.getPayloadsByType.and.returnValue(NO_SCOPES_DECISIONS);

    const responseSecondEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseSecondEvent.getPayloadsByType.and.returnValue(SCOPES_DECISIONS_2);

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
    expect(result.length).toEqual(1);
    expect(result[0].id).toEqual("TNT:activity1:experience1");
  });

  it("expects getDecision to return empty array if event didn't get any decision", () => {
    const isViewStart = true;
    const scopes = ["Foo1", "Foo3"];

    const response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    response.getPayloadsByType.and.returnValue([]);
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

  it("expects getDecision to return scope decisions, one scope - multiple decisions", () => {
    const isViewStart = true;
    const scopes = ["Foo5"];

    const response = jasmine.createSpyObj("response", ["getPayloadsByType"]);
    response.getPayloadsByType.and.returnValue(NO_SCOPES_DECISIONS);

    const responseSecondEvent = jasmine.createSpyObj("response", [
      "getPayloadsByType"
    ]);
    responseSecondEvent.getPayloadsByType.and.returnValue(
      SAME_SCOPE_MULTIPLE_DECISIONS
    );
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
