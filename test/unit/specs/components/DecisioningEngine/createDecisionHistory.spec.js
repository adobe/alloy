/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { PropositionEventType } from "../../../../../src/components/Personalization/constants/propositionEventType";
import recordQualifiedModule from "../../../../../src/components/DecisioningEngine/createDecisionHistory";

describe("DecisioningEngine:decisionHistory", () => {
  it("should call eventRegistry.addEvent with the correct arguments when provided with an id", () => {
    const eventRegistry = {
      addEvent: jasmine.createSpy("addEvent")
    };
    const module = recordQualifiedModule({ eventRegistry });
    const id = "someId";
    module.recordQualified(id);
    expect(eventRegistry.addEvent).toHaveBeenCalledWith(
      {},
      PropositionEventType.TRIGGER,
      id
    );
  });

  it("should return undefined when not provided with an id", () => {
    const eventRegistry = {
      addEvent: jasmine.createSpy("addEvent")
    };

    const module = recordQualifiedModule({ eventRegistry });

    const result = module.recordQualified();
    expect(eventRegistry.addEvent).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
});
