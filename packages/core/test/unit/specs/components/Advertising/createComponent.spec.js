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

import { vi, beforeEach, describe, it, expect } from "vitest";
import createComponent from "../../../../../src/components/Advertising/createComponent.js";

describe("Advertising::createComponent", () => {
  let handleOnBeforeSendEvent;
  let sendAdConversionHandler;
  let component;

  beforeEach(() => {
    handleOnBeforeSendEvent = vi.fn();
    sendAdConversionHandler = vi.fn();

    component = createComponent({
      handleOnBeforeSendEvent,
      sendAdConversionHandler,
    });
  });

  it("should create component with lifecycle hooks", () => {
    expect(component).toHaveProperty("lifecycle");
    expect(component.lifecycle).toHaveProperty("onComponentsRegistered");
    expect(component.lifecycle).toHaveProperty("onBeforeEvent");
    expect(typeof component.lifecycle.onComponentsRegistered).toBe("function");
    expect(typeof component.lifecycle.onBeforeEvent).toBe("function");
    expect(component.lifecycle.onBeforeEvent).toBe(handleOnBeforeSendEvent);
  });

  it("calls sendAdConversionHandler on registration", () => {
    component.lifecycle.onComponentsRegistered();
    expect(sendAdConversionHandler).toHaveBeenCalledTimes(1);
  });

  it("delegates onBeforeEvent to injected handler", async () => {
    const event = { mergeQuery: vi.fn() };
    const advertising = { handleAdvertisingData: "wait" };

    await component.lifecycle.onBeforeEvent({ event, advertising });

    expect(handleOnBeforeSendEvent).toHaveBeenCalledWith({
      event,
      advertising,
    });
  });
});
