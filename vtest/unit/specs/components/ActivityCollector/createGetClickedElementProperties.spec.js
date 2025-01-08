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
import createGetClickedElementProperties from "../../../../../src/components/ActivityCollector/createGetClickedElementProperties.js";
import createClickActivityStorage from "../../../../../src/components/ActivityCollector/createClickActivityStorage.js";

describe("ActivityCollector::createGetClickedElementProperties", () => {
  const mockWindow = {
    location: {
      protocol: "https:",
      host: "example.com",
      hostname: "example.com",
      pathname: "/",
      href: "https://example.com/",
    },
  };
  const supportedLinkElement = {
    tagName: "A",
    href: "index.html",
    nodeType: 1,
  };
  let getLinkName;
  let getLinkRegion;
  let getAbsoluteUrlFromAnchorElement;
  let findClickableElement;
  let determineLinkType;
  let logger;
  let clickActivityStorage;
  beforeEach(() => {
    getLinkName = vi.fn();
    getLinkRegion = vi.fn();
    getAbsoluteUrlFromAnchorElement = vi.fn();
    findClickableElement = vi.fn();
    determineLinkType = vi.fn();
    logger = {
      info: vi.fn(),
    };
    clickActivityStorage = createClickActivityStorage({
      storage: {
        getItem: () => {},
        setItem: () => {},
        removeItem: () => {},
      },
    });
  });
  it("Returns complete linkDetails when it is a supported anchor element", () => {
    const config = {
      onBeforeLinkClickSend: (options) => {
        options.data.custom = "test data field";
        return true;
      },
      clickCollection: {
        externalLink: true,
      },
    };
    getLinkRegion.mockReturnValue("root");
    getLinkName.mockReturnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.mockReturnValue("http://blah.com");
    findClickableElement.mockReturnValue(supportedLinkElement);
    determineLinkType.mockReturnValue("exit");
    const getClickedElementProperties = createGetClickedElementProperties({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findClickableElement,
      determineLinkType,
      window: mockWindow,
    });
    const result = getClickedElementProperties({
      clickedElement: {},
      config,
      logger,
      clickActivityStorage,
    });
    // I have to set this manually because of passing in {} as the clickedElement
    result.pageIDType = 0;
    expect(result.options).toEqual({
      xdm: {
        eventType: "web.webinteraction.linkClicks",
        web: {
          webInteraction: {
            name: "Go to cart",
            region: "root",
            type: "exit",
            URL: "http://blah.com",
            linkClicks: {
              value: 1,
            },
          },
        },
      },
      data: {
        __adobe: {
          analytics: {
            contextData: {
              a: {
                activitymap: {
                  page: "https://example.com/",
                  link: "Go to cart",
                  region: "root",
                  pageIDType: 0,
                },
              },
            },
          },
        },
        custom: "test data field",
      },
      clickedElement: {},
    });
  });
  it("Returns undefined when the customer callback returns false", () => {
    const config = {
      onBeforeLinkClickSend: () => {
        return false;
      },
      clickCollection: {
        externalLink: true,
      },
    };
    getLinkRegion.mockReturnValue("root");
    getLinkName.mockReturnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.mockReturnValue("http://blah.com");
    findClickableElement.mockReturnValue(supportedLinkElement);
    determineLinkType.mockReturnValue("exit");
    const getClickedElementProperties = createGetClickedElementProperties({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findClickableElement,
      determineLinkType,
      window: mockWindow,
    });
    const result = getClickedElementProperties({
      clickedElement: {},
      config,
      logger,
      clickActivityStorage,
    });
    expect(result.options).toEqual(undefined);
  });
  it("Returns undefined when not supported anchor element", () => {
    const config = {
      onBeforeLinkClickSend: () => {
        return true;
      },
      clickCollection: {
        externalLink: true,
      },
    };
    getLinkRegion.mockReturnValue(undefined);
    getLinkName.mockReturnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.mockReturnValue("http://blah.com");
    findClickableElement.mockReturnValue(undefined);
    determineLinkType.mockReturnValue("exit");
    const getClickedElementProperties = createGetClickedElementProperties({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findClickableElement,
      determineLinkType,
      window: mockWindow,
    });
    const result = getClickedElementProperties({
      clickedElement: {},
      config,
      logger,
      clickActivityStorage,
    });
    expect(result.options).toEqual(undefined);
  });
  it("Returns only options with data element if clickable element is missing href", () => {
    const config = {
      onBeforeLinkClickSend: () => {
        return true;
      },
      clickCollection: {
        externalLink: true,
      },
    };
    getLinkRegion.mockReturnValue("root");
    getLinkName.mockReturnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.mockReturnValue(undefined);
    findClickableElement.mockReturnValue(supportedLinkElement);
    determineLinkType.mockReturnValue("exit");
    const getClickedElementProperties = createGetClickedElementProperties({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findClickableElement,
      determineLinkType,
      window: mockWindow,
    });
    const result = getClickedElementProperties({
      clickedElement: {},
      config,
      logger,
      clickActivityStorage,
    });
    // I have to set this manually because of passing in {} as the clickedElement
    result.pageIDType = 0;
    expect(result.options).toEqual({
      data: {
        __adobe: {
          analytics: {
            contextData: {
              a: {
                activitymap: {
                  page: "https://example.com/",
                  link: "Go to cart",
                  region: "root",
                  pageIDType: 0,
                },
              },
            },
          },
        },
      },
      clickedElement: {},
    });
  });
  it("Returns the object with link details when callback does not return explicit false ", () => {
    const config = {
      onBeforeLinkClickSend: () => {},
      clickCollection: {
        externalLink: true,
      },
    };
    getLinkRegion.mockReturnValue("root");
    getLinkName.mockReturnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.mockReturnValue("http://blah.com");
    findClickableElement.mockReturnValue(supportedLinkElement);
    determineLinkType.mockReturnValue("exit");
    const getClickedElementProperties = createGetClickedElementProperties({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findClickableElement,
      determineLinkType,
      window: mockWindow,
    });
    const result = getClickedElementProperties({
      clickedElement: {},
      config,
      logger,
      clickActivityStorage,
    });
    expect(result).not.toBe(undefined);
  });
});
