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
import { defer } from "../../../../../../src/utils/index.js";
import flushPromiseChains from "../../../../helpers/flushPromiseChains.js";
import createProcessRedirect from "../../../../../../src/components/Personalization/handlers/createProcessRedirect.js";

describe("createProcessRedirect", () => {
  let logger;
  let executeRedirect;
  let collect;
  let collectDefer;
  let item;
  let data;
  let proposition;
  let meta;
  let processRedirect;
  beforeEach(() => {
    logger = {
      warn: vi.fn(),
      logOnContentRendering: vi.fn(),
    };
    executeRedirect = vi.fn();
    collectDefer = defer();
    collect = vi.fn().mockReturnValue(collectDefer.promise);
    proposition = {
      getNotification() {
        return meta;
      },
    };
    item = {
      getData() {
        return data;
      },
      getProposition() {
        return proposition;
      },
    };
    processRedirect = createProcessRedirect({
      logger,
      executeRedirect,
      collect,
    });
  });
  it("returns an empty object if the item has no data", () => {
    data = undefined;
    expect(processRedirect(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid Redirect data",
      undefined,
    );
  });
  it("returns an empty object if the item has no content", () => {
    data = {
      a: 1,
    };
    expect(processRedirect(item)).toEqual({});
    expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith("Invalid Redirect data", {
      a: 1,
    });
  });
  it("redirects", async () => {
    data = {
      content: "mycontent",
    };
    meta = "mymetavalue";
    const result = processRedirect(item);
    expect(result).toEqual({
      render: expect.any(Function),
      setRenderAttempted: true,
      onlyRenderThis: true,
    });
    expect(collect).not.toHaveBeenCalled();
    expect(executeRedirect).not.toHaveBeenCalled();
    const renderPromise = result.render();
    await flushPromiseChains();
    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: ["mymetavalue"],
      documentMayUnload: true,
    });
    expect(executeRedirect).not.toHaveBeenCalled();
    collectDefer.resolve();
    await flushPromiseChains();
    expect(logger.logOnContentRendering).toHaveBeenCalledTimes(1);
    expect(executeRedirect).toHaveBeenCalledWith("mycontent");
    expect(await renderPromise).toBeUndefined();
  });
  it("doesn't eat the exception", async () => {
    data = {
      content: "mycontent",
    };
    meta = "mymetavalue";
    const result = processRedirect(item);
    const renderPromise = result.render();
    collectDefer.reject("myerror");
    expect(logger.logOnContentRendering).not.toHaveBeenCalled();
    await expect(renderPromise).rejects.toThrowError("myerror");
  });
});
