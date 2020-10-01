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

describe("Event Command", () => {
  let event;
  let logger;
  let eventManager;
  let sendEventCommand;
  beforeEach(() => {
    event = jasmine.createSpyObj("event", [
      "documentMayUnload",
      "setUserData",
      "setUserXdm",
      "mergeXdm",
      "mergeMeta"
    ]);
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
    sendEventCommand = dataCollector.commands.sendEvent;
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

    return sendEventCommand.run(options).then(result => {
      expect(event.documentMayUnload).toHaveBeenCalled();
      const xdmArg = event.setUserXdm.calls.argsFor(0)[0];
      expect(xdmArg).not.toBe(xdm);
      expect(xdmArg).toEqual(xdm);
      const dataArg = event.setUserData.calls.argsFor(0)[0];
      expect(dataArg).not.toBe(data);
      expect(dataArg).toEqual(data);
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisions: true,
        decisionScopes: []
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("sends event with decisionScopes parameter when decisionScopes is not empty", () => {
    const options = {
      renderDecisions: true,
      decisionScopes: ["Foo1", "Foo2"]
    };

    return sendEventCommand.run(options).then(result => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisions: true,
        decisionScopes: ["Foo1", "Foo2"]
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("does not call documentMayUnload if documentUnloading is not defined", () => {
    return sendEventCommand.run({}).then(() => {
      expect(event.documentMayUnload).not.toHaveBeenCalled();
    });
  });

  it("sets renderDecisions to false if renderDecisions is not defined", () => {
    return sendEventCommand.run({}).then(() => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisions: false,
        decisionScopes: []
      });
    });
  });

  it("merges eventType", () => {
    return sendEventCommand
      .run({
        type: "mytype"
      })
      .then(() => {
        expect(event.mergeXdm).toHaveBeenCalledWith({
          eventType: "mytype"
        });
      });
  });

  it("merges eventMergeID", () => {
    return sendEventCommand
      .run({
        mergeId: "mymergeid"
      })
      .then(() => {
        expect(event.mergeXdm).toHaveBeenCalledWith({
          eventMergeId: "mymergeid"
        });
      });
  });

  it("merges datasetId", () => {
    return sendEventCommand
      .run({
        datasetId: "mydatasetId"
      })
      .then(() => {
        expect(event.mergeMeta).toHaveBeenCalledWith({
          collect: {
            datasetId: "mydatasetId"
          }
        });
      });
  });
});
