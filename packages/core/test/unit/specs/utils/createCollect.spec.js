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
import { vi, beforeEach, describe, it, expect } from "vitest";
import createCollect from "../../../../src/utils/createCollect.js";
import { PropositionEventType } from "../../../../src/constants/propositionEventType.js";

describe("Utils::createCollect", () => {
  let eventManager;
  let mergeDecisionsMeta;
  let identityMapStorage;
  const decisionsMeta = [
    {
      id: 1,
      decisionId: "foo",
    },
  ];
  let event;
  beforeEach(() => {
    event = {
      mergeXdm: vi.fn(),
    };
    eventManager = {
      sendEvent: vi.fn().mockReturnValue(undefined),
      createEvent: vi.fn().mockReturnValue(event),
    };
    mergeDecisionsMeta = vi.fn();
    identityMapStorage = {
      get: vi.fn().mockReturnValue(undefined),
      store: vi.fn(),
      clear: vi.fn(),
    };
  });
  it("collects and sends event with metadata", () => {
    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta,
      identityMapStorage,
    });
    collect({
      decisionsMeta,
    });
    expect(eventManager.createEvent).toHaveBeenCalled();
    expect(event.mergeXdm).toHaveBeenCalledWith({
      eventType: "decisioning.propositionDisplay",
    });
    expect(mergeDecisionsMeta).toHaveBeenCalledWith(
      event,
      decisionsMeta,
      [PropositionEventType.DISPLAY],
      undefined,
    );
    expect(eventManager.sendEvent).toHaveBeenCalled();
  });

  it("includes stored identityMap in the event", () => {
    const storedIdentityMap = {
      CRM_ID: [{ id: "user123", primary: true }],
      ECID: [{ id: "ecid123" }],
    };
    identityMapStorage.get.mockReturnValue(storedIdentityMap);

    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta,
      identityMapStorage,
    });
    collect({
      decisionsMeta,
    });

    expect(identityMapStorage.get).toHaveBeenCalled();
    expect(event.mergeXdm).toHaveBeenCalledWith({
      eventType: "decisioning.propositionDisplay",
    });
    expect(event.mergeXdm).toHaveBeenCalledWith({
      identityMap: storedIdentityMap,
    });
    expect(eventManager.sendEvent).toHaveBeenCalled();
  });

  it("does not merge identityMap when storage is empty", () => {
    identityMapStorage.get.mockReturnValue(undefined);

    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta,
      identityMapStorage,
    });
    collect({
      decisionsMeta,
    });

    expect(identityMapStorage.get).toHaveBeenCalled();
    expect(event.mergeXdm).toHaveBeenCalledTimes(1);
    expect(event.mergeXdm).toHaveBeenCalledWith({
      eventType: "decisioning.propositionDisplay",
    });
  });
});
