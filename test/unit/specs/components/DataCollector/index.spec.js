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

import createDataCollector from "../../../../../src/components/DataCollector/index.js";
import { noop } from "../../../../../src/utils/index.js";

describe("Event Command", () => {
  let event;
  let eventManager;
  let logger;
  let sendEventCommand;
  beforeEach(() => {
    event = jasmine.createSpyObj("event", [
      "documentMayUnload",
      "setUserData",
      "setUserXdm",
      "mergeXdm",
      "mergeMeta",
      "mergeConfigOverride"
    ]);
    logger = jasmine.createSpyObj("logger", ["warn"]);

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
      otherSetting: "foo",
      type: "test",
      xdm,
      data,
      documentUnloading: true
    };

    return sendEventCommand.run(options).then(result => {
      expect(event.documentMayUnload).toHaveBeenCalled();
      expect(event.setUserXdm).toHaveBeenCalledWith(xdm);
      expect(event.setUserData).toHaveBeenCalledWith(data);
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        otherSetting: "foo"
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("sends event with decisionScopes parameter when decisionScopes is not empty", () => {
    const options = {
      renderDecisions: true,
      decisionScopes: ["Foo1"],
      personalization: {
        decisionScopes: ["Foo2"]
      }
    };

    return sendEventCommand.run(options).then(result => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisions: true,
        decisionScopes: ["Foo1"],
        personalization: {
          decisionScopes: ["Foo2"]
        }
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("sends event with surfaces parameter when surfaces is not empty", () => {
    const options = {
      renderDecisions: true,
      personalization: {
        surfaces: ["Foo1", "Foo2"]
      }
    };

    return sendEventCommand.run(options).then(result => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        renderDecisions: true,
        personalization: {
          surfaces: ["Foo1", "Foo2"]
        }
      });
      expect(result).toEqual("sendEventResult");
    });
  });

  it("does not call documentMayUnload if documentUnloading is not defined", () => {
    return sendEventCommand.run({}).then(() => {
      expect(event.documentMayUnload).not.toHaveBeenCalled();
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

  it("merges datasetId into the override configuration", () => {
    const datasetId = "mydatasetId";
    return sendEventCommand
      .run({
        datasetId
      })
      .then(() => {
        expect(eventManager.sendEvent).toHaveBeenCalledWith(
          jasmine.any(Object),
          {
            edgeConfigOverrides: {
              com_adobe_experience_platform: {
                datasets: {
                  event: { datasetId }
                }
              }
            }
          }
        );
        expect(logger.warn).toHaveBeenCalled();
      });
  });

  it("includes configuration if provided", () => {
    return sendEventCommand
      .run({
        renderDecisions: true,
        edgeConfigOverrides: {
          target: {
            propertyToken: "hello"
          }
        }
      })
      .then(() => {
        expect(eventManager.sendEvent).toHaveBeenCalledWith(
          jasmine.any(Object),
          {
            renderDecisions: true,
            edgeConfigOverrides: {
              target: {
                propertyToken: "hello"
              }
            }
          }
        );
      });
  });
});
