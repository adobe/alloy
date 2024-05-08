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
import createProcessHtmlContent from "../../../../../../src/components/Personalization/handlers/createProcessHtmlContent.js";

describe("createProcessHtmlContent", () => {
  let modules;
  let logger;
  let item;
  let data;
  let processHtmlContent;

  beforeEach(() => {
    modules = {
      typeA: jasmine.createSpy("typeA"),
      typeB: jasmine.createSpy("typeB")
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);
    item = {
      getData() {
        return data;
      }
    };

    processHtmlContent = createProcessHtmlContent({ modules, logger });
  });

  it("returns an empty object if the item has no data", () => {
    data = undefined;
    expect(processHtmlContent(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("returns an empty object if the item has no type", () => {
    data = { selector: ".myselector" };
    expect(processHtmlContent(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("returns an empty object if the item has no selector", () => {
    data = { type: "mytype" };
    expect(processHtmlContent(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("returns an empty object if the item has an unknown type, and logs unknown type", () => {
    data = { type: "typeC", selector: ".myselector", content: "mycontent" };
    expect(processHtmlContent(item)).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).toHaveBeenCalledWith("Invalid HTML content data", {
      type: "typeC",
      selector: ".myselector",
      content: "mycontent"
    });
  });

  it("handles a known type", () => {
    data = { type: "typeA", selector: ".myselector", content: "mycontent" };
    const result = processHtmlContent(item);
    expect(result).toEqual({
      render: jasmine.any(Function),
      setRenderAttempted: true,
      includeInNotification: true
    });
    expect(modules.typeA).not.toHaveBeenCalled();
    result.render();
    expect(modules.typeA).toHaveBeenCalledWith({
      type: "typeA",
      selector: ".myselector",
      content: "mycontent"
    });
  });
});
