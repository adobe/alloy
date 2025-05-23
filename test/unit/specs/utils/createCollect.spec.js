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
  const decisionsMeta = [
    {
      id: 1,
      decisionId: "foo",
    },
  ];
  const event = {
    mergeXdm: vi.fn(),
  };
  beforeEach(() => {
    eventManager = {
      sendEvent: vi.fn().mockReturnValue(undefined),
      createEvent: vi.fn().mockReturnValue(event),
    };
    mergeDecisionsMeta = vi.fn();
  });
  it("collects and sends event with metadata", () => {
    const collect = createCollect({
      eventManager,
      mergeDecisionsMeta,
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
});
