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
import createProcessHtmlContent from "../../../../../../src/components/Personalization/handlers/createProcessHtmlContent";
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";
import injectCreateProposition from "../../../../../../src/components/Personalization/handlers/injectCreateProposition";
import { HTML_CONTENT_ITEM } from "../../../../../../src/constants/schema";

describe("createProcessHtmlContent", () => {
  let modules;
  let logger;
  let processHtmlContent;

  const createProposition = injectCreateProposition({
    preprocess: data => data,
    isPageWideSurface: () => false
  });

  const createMockProposition = item => {
    return createProposition({
      id: "id",
      scope: "scope",
      scopeDetails: { characteristics: { scopeType: "page" } },
      items: [item]
    });
  };

  beforeEach(() => {
    const { storeClickMeta } = createClickStorage();

    modules = {
      typeA: jasmine.createSpy("typeA"),
      typeB: jasmine.createSpy("typeB")
    };
    logger = jasmine.createSpyObj("logger", ["warn"]);

    processHtmlContent = createProcessHtmlContent({
      modules,
      logger,
      storeClickMeta
    });
  });

  it("returns an empty object if the item has no data", () => {
    const proposition = createMockProposition({
      schema: HTML_CONTENT_ITEM,
      data: undefined
    });

    expect(processHtmlContent(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("returns an empty object if the item has no type", () => {
    const proposition = createMockProposition({
      schema: HTML_CONTENT_ITEM,
      data: { selector: ".myselector" }
    });

    expect(processHtmlContent(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("returns an empty object if the item has no selector", () => {
    const proposition = createMockProposition({
      schema: HTML_CONTENT_ITEM,
      data: { type: "mytype" }
    });

    expect(processHtmlContent(proposition.getItems()[0])).toEqual({
      setRenderAttempted: false,
      includeInNotification: false
    });
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it("returns an empty object if the item has an unknown type, and logs unknown type", () => {
    const proposition = createMockProposition({
      schema: HTML_CONTENT_ITEM,
      data: {
        type: "typeC",
        selector: ".myselector",
        content: "mycontent"
      }
    });

    expect(processHtmlContent(proposition.getItems()[0])).toEqual({
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
    const proposition = createMockProposition({
      schema: HTML_CONTENT_ITEM,
      data: {
        type: "typeA",
        selector: ".myselector",
        content: "mycontent"
      }
    });

    const result = processHtmlContent(proposition.getItems()[0]);
    expect(result).toEqual({
      render: jasmine.any(Function),
      setRenderAttempted: true,
      includeInNotification: true
    });
    expect(modules.typeA).not.toHaveBeenCalled();
    result.render();
    expect(modules.typeA).toHaveBeenCalledWith(
      {
        type: "typeA",
        selector: ".myselector",
        content: "mycontent"
      },
      jasmine.any(Function)
    );
  });
});
