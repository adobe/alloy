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
  let eventManager;
  let eventCommand;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["documentUnloading", "mergeXdm"]);
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
      eventManager
    });
    eventCommand = dataCollector.commands.event;
  });

  it("sends event", () => {
    const xdm = { a: "b" };
    const data = { c: "d" };
    const options = {
      viewStart: true,
      xdm,
      data,
      documentUnloading: true
    };

    return eventCommand(options).then(result => {
      expect(event.documentUnloading).toHaveBeenCalled();
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        isViewStart: true,
        applyUserProvidedData: jasmine.any(Function)
      });
      expect(event.mergeXdm).toHaveBeenCalledWith(xdm);
      expect(event.data).toBe(data);
      expect(result).toEqual("sendEventResult");
    });
  });

  it("does not call documentUnloading if documentUnloading is not defined", () => {
    return eventCommand({}).then(() => {
      expect(event.documentUnloading).not.toHaveBeenCalled();
    });
  });

  it("sets isViewStart to false if viewStart is not defined", () => {
    return eventCommand({}).then(() => {
      expect(eventManager.sendEvent).toHaveBeenCalledWith(event, {
        isViewStart: false,
        applyUserProvidedData: jasmine.any(Function)
      });
    });
  });
});
