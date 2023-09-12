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
import createRender from "../../../../../../src/components/Personalization/handlers/createRender";

describe("Personalization::handlers::createRender", () => {
  let handleChain;
  let collect;
  let executeRedirect;
  let logger;
  let showContainers;

  let proposition1;
  let proposition2;

  let render;

  beforeEach(() => {
    handleChain = jasmine.createSpy("handleChain");
    collect = jasmine.createSpy("collect");
    executeRedirect = jasmine.createSpy("executeRedirect");
    logger = jasmine.createSpyObj("logger", ["warn"]);
    showContainers = jasmine.createSpy("showContainers");
    proposition1 = jasmine.createSpyObj("proposition1", [
      "getRedirectUrl",
      "addToNotifications",
      "render"
    ]);
    proposition2 = jasmine.createSpyObj("proposition2", [
      "getRedirectUrl",
      "addToNotifications",
      "render"
    ]);
    render = createRender({
      handleChain,
      collect,
      executeRedirect,
      logger,
      showContainers
    });
  });

  it("does nothing with an empty array", async () => {
    const returnValue = await render([]);
    expect(handleChain).not.toHaveBeenCalled();
    expect(collect).not.toHaveBeenCalled();
    expect(executeRedirect).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(showContainers).not.toHaveBeenCalled();
    expect(returnValue).toEqual([]);
  });

  it("returns notifications", async () => {
    proposition1.render.and.returnValue("rendered1");
    proposition2.render.and.returnValue("rendered2");
    const returnValue = await render([proposition1, proposition2]);
    expect(handleChain).toHaveBeenCalledWith(proposition1);
    expect(handleChain).toHaveBeenCalledWith(proposition2);
    expect(returnValue).toEqual(["rendered1", "rendered2"]);
  });

  it("returns empty notifications", async () => {
    const returnValue = await render([proposition1, proposition2]);
    expect(returnValue).toEqual([]);
  });

  it("handles a redirect", async () => {
    proposition1.getRedirectUrl.and.returnValue("redirect1");
    collect.and.returnValue(Promise.resolve());
    proposition1.addToNotifications.and.callFake(array => {
      array.push("notification1");
    });
    await render([proposition1, proposition2]);
    expect(executeRedirect).toHaveBeenCalledWith("redirect1");
    expect(collect).toHaveBeenCalledOnceWith({
      decisionsMeta: ["notification1"]
    });
    expect(showContainers).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("handles an error in a redirect", async () => {
    proposition1.getRedirectUrl.and.returnValue("redirect1");
    collect.and.returnValue(Promise.resolve());
    executeRedirect.and.throwError("error1");
    await render([proposition1, proposition2]);
    expect(showContainers).toHaveBeenCalledOnceWith();
    expect(logger.warn).toHaveBeenCalledTimes(1);
  });
});
