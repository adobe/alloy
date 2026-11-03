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
import createProcessInAppMessage from "../../../../../../src/components/Personalization/handlers/createProcessInAppMessage.js";

describe("Personalization::handlers::createProcessInAppMessage", () => {
  let item;
  let data;
  let meta;
  let modules;
  let logger;
  let processInAppMessage;
  beforeEach(() => {
    item = {
      getData() {
        return data;
      },
      getProposition() {
        return {
          getNotification: () => meta,
          shouldSuppressDisplay: () => false,
          getIdentityMap: () => undefined,
        };
      },
    };
    modules = {
      defaultContent: vi.fn(),
    };
    logger = {
      warn: vi.fn(),
    };
    processInAppMessage = createProcessInAppMessage({
      modules,
      logger,
    });
  });
  it("returns an empty object if the item has no data, and logs missing type", () => {
    data = undefined;
    expect(processInAppMessage(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid in-app message data: undefined.",
      undefined,
    );
  });
  it("returns an empty object if the item has an unknown type, and logs unknown type", () => {
    data = {
      type: "wtf",
    };
    expect(processInAppMessage(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid in-app message data: unknown type.",
      data,
    );
  });
  it("handles a valid in app message type", () => {
    meta = {
      id: "abc",
      scope: "web://mywebsite.com",
      scopeDetails: {
        decisionProvider: "AJO",
        correlationID: "21d",
        characteristics: {
          eventToken: "yadayaya",
        },
        activity: {
          id: "foo#bar",
        },
      },
    };
    data = {
      mobileParameters: {
        verticalAlign: "center",
        horizontalAlign: "center",
        uiTakeover: true,
        width: 72,
        backdropColor: "#4CA206",
        height: 63,
      },
      webParameters: {},
      content: "<html></html>",
      contentType: "text/html",
      qualifiedDate: 1694731987996,
    };
    const result = processInAppMessage(item);
    expect(result).toEqual({
      render: expect.any(Function),
      setRenderAttempted: true,
      includeInNotification: true,
    });
    expect(modules.defaultContent).not.toHaveBeenCalled();
    result.render();
    expect(modules.defaultContent).toHaveBeenCalledWith({
      ...data,
      meta,
      identityMap: undefined,
    });
  });
  it("rejects a non-string contentType, and logs", () => {
    meta = { id: "abc" };
    data = { content: "<div>message</div>", contentType: 42 };
    expect(processInAppMessage(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid in-app message data: 'contentType' must be a string.",
      data,
    );
  });
  it("rejects JSON content that is not an object, and logs", () => {
    meta = { id: "abc" };
    data = { content: null, contentType: "application/json" };
    expect(processInAppMessage(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid in-app message data: 'content' must be an object.",
      data,
    );
  });
  it("rejects parameters that are not objects, and logs", () => {
    meta = { id: "abc" };
    data = {
      content: "<div>message</div>",
      contentType: "text/html",
      webParameters: "wide",
    };
    expect(processInAppMessage(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid in-app message data: 'webParameters' must be an object.",
      data,
    );
  });
  it("handles an invalid in app message type, and logs", () => {
    meta = {
      id: "abc",
      scope: "web://mywebsite.com",
      scopeDetails: {
        decisionProvider: "AJO",
        correlationID: "21d",
        characteristics: {
          eventToken: "yadayaya",
        },
        activity: {
          id: "foo#bar",
        },
      },
    };
    data = {
      mobileParameters: {
        verticalAlign: "center",
        horizontalAlign: "center",
        uiTakeover: true,
        width: 72,
        backdropColor: "#4CA206",
        height: 63,
      },
      webParameters: {},
      contentType: "text/html",
      qualifiedDate: 1694731987996,
    };
    expect(processInAppMessage(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid in-app message data: missing property 'content'.",
      data,
    );
  });
});
