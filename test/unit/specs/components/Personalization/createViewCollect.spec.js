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
import createViewCollect from "../../../../../src/components/Personalization/createViewCollect";
import { DECISIONING_PROPOSITION_DISPLAY } from "../../../../../src/components/Personalization/constants/eventType";

describe("Personalization::createViewCollect", () => {
  let eventManager;
  let mergeDecisionsMeta;
  const decisionsMeta = [
    {
      id: "foo1",
      scope: "cart"
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

  it("sends event with metadata when decisions is not empty", () => {
    const expectedXdmObject = {
      eventType: DECISIONING_PROPOSITION_DISPLAY,
      web: {
        webPageDetails: {
          viewName: "cart"
        }
      }
    };
    const collect = createViewCollect({ eventManager, mergeDecisionsMeta });

    collect({ decisionsMeta });

    expect(eventManager.createEvent).toHaveBeenCalled();
    expect(event.mergeXdm).toHaveBeenCalledWith(expectedXdmObject);
    expect(mergeDecisionsMeta).toHaveBeenCalledWith(event, decisionsMeta);
    expect(eventManager.sendEvent).toHaveBeenCalled();
  });

  it("sends event with xdm viewName when decisions metadata is empty", () => {
    const xdmObject = {
      web: {
        webPageDetails: {
          viewName: "cart"
        }
      }
    };
    const data = {
      eventType: DECISIONING_PROPOSITION_DISPLAY
    };
    const collect = createViewCollect({ eventManager, mergeDecisionsMeta });

    collect({ decisionsMeta: [], xdm: xdmObject });

    expect(eventManager.createEvent).toHaveBeenCalled();
    expect(event.mergeXdm).toHaveBeenCalledWith(data);
    expect(event.mergeXdm).toHaveBeenCalledWith(xdmObject);
    expect(mergeDecisionsMeta).not.toHaveBeenCalled();
    expect(eventManager.sendEvent).toHaveBeenCalled();
  });
});
