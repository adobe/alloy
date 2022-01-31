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
import createCollect from "../../../../../src/components/Personalization/createCollect";
import { DECISIONING_PROPOSITION_DISPLAY } from "../../../../../src/components/Personalization/constants/eventType";

describe("Personalization::createCollect", () => {
  let eventManager;
  let mergeDecisionsMeta;
  const decisionsMeta = [
    {
      id: 1,
      decisionId: "foo"
    }
  ];
  const event = {
    mergeXdm: jasmine.createSpy()
  };

  beforeEach(() => {
    eventManager = jasmine.createSpyObj("eventManager", {
      sendEvent: undefined,
      createEvent: event
    });
    mergeDecisionsMeta = jasmine.createSpy("mergeDecisionsMeta");
  });

  it("collects and sends event with metadata", () => {
    const collect = createCollect({ eventManager, mergeDecisionsMeta });
    collect({ decisionsMeta });
    expect(eventManager.createEvent).toHaveBeenCalled();
    expect(event.mergeXdm).toHaveBeenCalledWith({
      eventType: DECISIONING_PROPOSITION_DISPLAY
    });
    expect(mergeDecisionsMeta).toHaveBeenCalledWith(event, decisionsMeta);
    expect(eventManager.sendEvent).toHaveBeenCalled();
  });
});
