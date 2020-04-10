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

import createDataCollector from "../../../../../src/components/DataCollector/index";
import { noop } from "../../../../../src/utils";
import createEvent from "../../../../../src/core/createEvent";

describe("Event Command", () => {
  let event;
  let logger;
  let eventManager;
  let eventCommand;
  beforeEach(() => {
    event = createEvent();
    spyOn(event, "documentMayUnload").and.callThrough();
    spyOn(event, "setUserData").and.callThrough();
    spyOn(event, "setUserXdm").and.callThrough();
    logger = jasmine.createSpyObj("logger", {
      warn: undefined
    });

    eventManager = {
      createEvent() {
        return event;
      },
      sendEvent: jasmine
        .createSpy()
        .and.callFake((_event, { applyUserProvidedData = noop }) => {
          applyUserProvidedData();
          return Promise.resolve("sendEventResult");
        })
    };

    const dataCollector = createDataCollector({
      eventManager,
      logger
    });
    eventCommand = dataCollector.commands.event;
  });

  it("sends event", () => {
    const xdm = { a: "b" };
    const data = { c: "d" };
    const options = {
      renderDecisions: true,
      type: "test",
      xdm,
      data,
      documentUnloading: true
    };

    return eventCommand.run(options).then(result => {
      expect(event.documentMayUnload).toHaveBeenCalled();
      expect(event.setUserXdm).toHaveBeenCalledWith(xdm);
      expect(event.setUserData).toHaveBeenCalledWith(data);
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisionsEnabled: true,
        decisionsScopes: []
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("sends event with decisionsScopes parameter when decisionsScopes is not empty", () => {
    const options = {
      renderDecisions: true,
      decisionsScopes: ["Foo1", "Foo2"]
    };

    return eventCommand.run(options).then(result => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisionsEnabled: true,
        decisionsScopes: ["Foo1", "Foo2"]
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("does not call documentMayUnload if documentUnloading is not defined", () => {
    return eventCommand.run({}).then(() => {
      expect(event.documentMayUnload).not.toHaveBeenCalled();
    });
  });

  it("sets renderDecisionsEnabled to false if renderDecisions is not defined", () => {
    return eventCommand.run({}).then(() => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisionsEnabled: false,
        decisionsScopes: []
      });
    });
  });

  it("sets eventType and eventMergeId", () => {
    return eventCommand
      .run({
        type: "mytype",
        mergeId: "mymergeid"
      })
      .then(() => {
        expect(event.setUserXdm).toHaveBeenCalledWith({
          eventType: "mytype",
          eventMergeId: "mymergeid"
        });
      });
  });

  it("merges eventType and eventMergeId with the userXdm", () => {
    return eventCommand
      .run({
        xdm: { key: "value" },
        type: "mytype",
        mergeId: "mymergeid"
      })
      .then(() => {
        expect(event.setUserXdm).toHaveBeenCalledWith({
          key: "value",
          eventType: "mytype",
          eventMergeId: "mymergeid"
        });
      });
  });
});
