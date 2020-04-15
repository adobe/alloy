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
  const cfg = {};
  let eventManager;
  let lifecycle;
  let clickHandler;
  beforeEach(() => {
    cfg.clickCollectionEnabled = true;
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
  });

  it("Attaches click handler if clickCollectionEnabled is set to true", () => {
    attachClickActivityCollector(cfg, eventManager, lifecycle);
    expect(document.addEventListener).toHaveBeenCalled();
  });

  it("Does not attach click handler if clickCollectionEnabled is set to false", () => {
    cfg.clickCollectionEnabled = false;
    attachClickActivityCollector(cfg, eventManager, lifecycle);
    expect(document.addEventListener).not.toHaveBeenCalled();
  });

  it("Publishes onClick lifecycle events at clicks when clickCollectionEnabled is set to true", () => {
    attachClickActivityCollector(cfg, eventManager, lifecycle);
    clickHandler({});
    expect(lifecycle.onClick).toHaveBeenCalled();
  });

  it("Augments error that occurs inside onClick lifecycle", () => {
    lifecycle.onClick.and.returnValue(
      Promise.reject(new Error("Bad thing happened."))
    );
    attachClickActivityCollector(cfg, eventManager, lifecycle);
    expectAsync(clickHandler({})).toBeRejectedWithError(
      "Failed to track click\nCaused by: Bad thing happened."
    );
  });

  it("Sends populated events", () => {
    eventManager.createEvent = () => {
      return {
        isEmpty: () => false
      };
    };
    spyOn(eventManager, "sendEvent").and.callThrough();
    attachClickActivityCollector(cfg, eventManager, lifecycle);
    return clickHandler({}).then(() => {
      expect(eventManager.sendEvent).toHaveBeenCalled();
    });
  });

  it("Does not send empty events", () => {
    spyOn(eventManager, "sendEvent").and.callThrough();
    attachClickActivityCollector(cfg, eventManager, lifecycle);
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
    attachClickActivityCollector(cfg, eventManager, lifecycle);
    return clickHandler({}).then(result => {
      expect(result).toBe(undefined);
    });
  });
});
