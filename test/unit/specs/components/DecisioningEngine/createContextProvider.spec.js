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
import createContextProvider from "../../../../../src/components/DecisioningEngine/createContextProvider";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createContextProvider", () => {
  let contextProvider;
  let eventRegistry;

  it("includes provided context passed in", () => {
    eventRegistry = createEventRegistry();
    contextProvider = createContextProvider({ eventRegistry });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual({
      cool: "beans",
      events: {}
    });
  });

  it("includes provided context passed in", () => {
    const events = {
      abc: {
        event: { id: "abc", type: "display" },
        timestamp: new Date().getTime(),
        count: 1
      }
    };

    eventRegistry = {
      toJSON: () => events
    };
    contextProvider = createContextProvider({ eventRegistry });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual({
      cool: "beans",
      events
    });
  });
});
