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

import attachClickActivityCollector from "../../../../../src/components/ActivityCollector/attachClickActivityCollector";

describe("ActivityCollector::attachClickActivityCollector", () => {
  const config = {};
  let eventManager;
  let lifecycle;
  let clickHandler;
  let handleError;
  beforeEach(() => {
    config.clickCollectionEnabled = true;
    eventManager = {
      createEvent: () => {
        return {
          isEmpty: () => true
        };
      },
      sendEvent: () => {
        return Promise.resolve();
      }
    };
    lifecycle = jasmine.createSpyObj("lifecycle", {
      onClick: Promise.resolve()
    });
    // eslint-disable-next-line no-unused-vars
    spyOn(document, "addEventListener").and.callFake((name, handler, type) => {
      clickHandler = handler;
    });
    handleError = jasmine.createSpy("handleError");
  });

  const build = () => {
    attachClickActivityCollector({
      config,
      eventManager,
      lifecycle,
      handleError
    });
  };

  it("Attaches click handler if clickCollectionEnabled is set to true", () => {
    build();
    expect(document.addEventListener).toHaveBeenCalled();
  });

  it("Does not attach click handler if clickCollectionEnabled is set to false", () => {
    config.clickCollectionEnabled = false;
    build();
    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it("Publishes onClick lifecycle events at clicks when clickCollectionEnabled is set to true", () => {
    build();
    clickHandler({});
    expect(lifecycle.onClick).toHaveBeenCalled();
  });

  it("Handles errors inside onClick lifecycle", () => {
    const error = new Error("Bad thing happend.");
    lifecycle.onClick.and.returnValue(Promise.reject(error));
    build();
    return clickHandler({}).then(() => {
      expect(handleError).toHaveBeenCalledWith(error, "click collection");
    });
  });

  it("Sends populated events", () => {
    eventManager.createEvent = () => {
      return {
        isEmpty: () => false
      };
    };
    spyOn(eventManager, "sendEvent").and.callThrough();
    build();
    return clickHandler({}).then(() => {
      expect(eventManager.sendEvent).toHaveBeenCalled();
    });
  });

  it("Does not send empty events", () => {
    spyOn(eventManager, "sendEvent").and.callThrough();
    build();
    return clickHandler({}).then(() => {
      expect(eventManager.sendEvent).not.toHaveBeenCalled();
    });
  });

  it("returns undefined", () => {
    eventManager.createEvent = () => {
      return {
        isEmpty: () => false
      };
    };
    build();
    return clickHandler({}).then(result => {
      expect(result).toBe(undefined);
    });
  });

  it("handles errors thrown in sendEvent", () => {
    const error = new Error("Network Error");
    eventManager.createEvent = () => {
      return {
        isEmpty: () => false
      };
    };
    spyOn(eventManager, "sendEvent").and.returnValue(Promise.reject(error));
    build();
    return clickHandler({}).then(() => {
      expect(handleError).toHaveBeenCalledWith(error, "click collection");
    });
  });
});
