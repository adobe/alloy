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

import { vi, beforeEach, describe, it, expect } from "vitest";
import attachClickActivityCollector from "../../../../../src/components/ActivityCollector/attachClickActivityCollector.js";
import flushPromiseChains from "../../../helpers/flushPromiseChains.js";

describe("ActivityCollector::attachClickActivityCollector", () => {
  const config = {};
  let eventManager;
  let lifecycle;
  let clickHandler;
  let handleError;
  beforeEach(() => {
    config.clickCollectionEnabled = true;
    eventManager = {
      createEvent: vi.fn().mockReturnValue({
        isEmpty: () => false,
        documentMayUnload: () => false,
      }),
      sendEvent: vi.fn().mockReturnValue(Promise.resolve()),
    };
    lifecycle = {
      onClick: vi.fn().mockReturnValue(Promise.resolve()),
    };

    vi.spyOn(document, "addEventListener").mockImplementation(
      (name, handler) => {
        clickHandler = handler;
      },
    );
    handleError = vi.fn();
  });
  const build = () => {
    attachClickActivityCollector({
      config,
      eventManager,
      lifecycle,
      handleError,
    });
  };
  it("Attaches click handler if clickCollectionEnabled is set to true", () => {
    build();
    expect(document.addEventListener).toHaveBeenCalled();
  });
  it("Attaches click handler if clickCollectionEnabled is set to false", () => {
    config.clickCollectionEnabled = false;
    build();
    expect(document.addEventListener).toHaveBeenCalled();
  });
  it("Publishes onClick lifecycle events at clicks when clickCollectionEnabled is set to true", () => {
    build();
    clickHandler({});
    expect(lifecycle.onClick).toHaveBeenCalled();
  });
  it("Does not publish onClick lifecycle events for AppMeasurement repropagated click-events", () => {
    build();
    const clickEvent = {
      s_fe: 1,
    };
    clickHandler(clickEvent);
    expect(lifecycle.onClick).not.toHaveBeenCalled();
  });
  it("Handles errors inside onClick lifecycle", () => {
    const error = new Error("Bad thing happened.");
    lifecycle.onClick.mockReturnValue(Promise.reject(error));
    build();
    return clickHandler({})
      .then(() => {
        return flushPromiseChains();
      })
      .then(() => {
        expect(handleError).toHaveBeenCalledWith(error, "click collection");
      });
  });
  it("Sends populated events", () => {
    build();
    return clickHandler({})
      .then(() => {
        return flushPromiseChains();
      })
      .then(() => {
        expect(eventManager.sendEvent).toHaveBeenCalled();
      });
  });
  it("Does not send empty events", () => {
    eventManager.createEvent.mockReturnValue({
      isEmpty: () => true,
      documentMayUnload: () => false,
    });
    build();
    return clickHandler({})
      .then(() => {
        return flushPromiseChains();
      })
      .then(() => {
        expect(eventManager.sendEvent).not.toHaveBeenCalled();
      });
  });
  it("handles errors thrown in sendEvent", () => {
    const error = new Error("Network Error");
    eventManager.sendEvent.mockReturnValue(Promise.reject(error));
    build();
    return clickHandler({})
      .then(() => {
        return flushPromiseChains();
      })
      .then(() => {
        expect(handleError).toHaveBeenCalledWith(error, "click collection");
      });
  });
});
