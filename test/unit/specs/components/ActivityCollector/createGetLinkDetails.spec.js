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

import createGetLinkDetails from "../../../../../src/components/ActivityCollector/createGetLinkDetails";

describe("ActivityCollector::createGetLinkDetails", () => {
  const mockWindow = {
    location: {
      protocol: "https:",
      host: "example.com",
      hostname: "example.com",
      pathname: "/"
    }
  };
  const supportedLinkElement = {
    tagName: "A",
    href: "index.html",
    nodeType: 1
  };

  let getLinkName;
  let getLinkRegion;
  let getAbsoluteUrlFromAnchorElement;
  let findSupportedAnchorElement;
  let determineLinkType;
  let logger;
  beforeEach(() => {
    getLinkName = jasmine.createSpy("getLinkName");
    getLinkRegion = jasmine.createSpy("getLinkRegion");
    getAbsoluteUrlFromAnchorElement = jasmine.createSpy(
      "getAbsoluteUrlFromAnchorElement"
    );
    findSupportedAnchorElement = jasmine.createSpy(
      "findSupportedAnchorElement"
    );
    determineLinkType = jasmine.createSpy("determineLinkType");
    logger = jasmine.createSpyObj("logger", ["info"]);
  });

  it("Returns complete linkDetails when it is a supported anchor element", () => {
    const config = {
      onBeforeLinkClickSend: options => {
        options.data.custom = "test data field";
        return true;
      }
    };
    getLinkRegion.and.returnValue("root");
    getLinkName.and.returnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.and.returnValue("http://blah.com");
    findSupportedAnchorElement.and.returnValue(supportedLinkElement);
    determineLinkType.and.returnValue("exit");

    const getLinkDetails = createGetLinkDetails({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findSupportedAnchorElement,
      determineLinkType,
      window: mockWindow
    });

    const result = getLinkDetails({ targetElement: {}, config, logger });
    expect(result).toEqual({
      xdm: {
        eventType: "web.webinteraction.linkClicks",
        web: {
          webInteraction: {
            name: "Go to cart",
            region: "root",
            type: "exit",
            URL: "http://blah.com",
            linkClicks: {
              value: 1
            }
          }
        }
      },
      data: {
        custom: "test data field"
      },
      clickedElement: {}
    });
  });

  it("Returns undefined when the customer callback returns false", () => {
    const config = {
      onBeforeLinkClickSend: () => {
        return false;
      }
    };
    getLinkRegion.and.returnValue("root");
    getLinkName.and.returnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.and.returnValue("http://blah.com");
    findSupportedAnchorElement.and.returnValue(supportedLinkElement);
    determineLinkType.and.returnValue("exit");

    const getLinkDetails = createGetLinkDetails({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findSupportedAnchorElement,
      determineLinkType,
      window: mockWindow
    });

    const result = getLinkDetails({ targetElement: {}, config, logger });
    expect(logger.info).toHaveBeenCalledWith(
      "This link click event is not triggered because it was canceled in onBeforeLinkClickSend."
    );
    expect(result).toEqual(undefined);
  });

  it("Returns undefined when not supported anchor element", () => {
    const config = {
      onBeforeLinkClickSend: () => {
        return true;
      }
    };
    getLinkRegion.and.returnValue(undefined);
    getLinkName.and.returnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.and.returnValue("http://blah.com");
    findSupportedAnchorElement.and.returnValue(undefined);
    determineLinkType.and.returnValue("exit");

    const getLinkDetails = createGetLinkDetails({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findSupportedAnchorElement,
      determineLinkType,
      window: mockWindow
    });

    const result = getLinkDetails({ targetElement: {}, config, logger });
    expect(logger.info).toHaveBeenCalledWith(
      "This link click event is not triggered because the HTML element is not an anchor."
    );
    expect(result).toEqual(undefined);
  });

  it("Returns undefined when element without url and logs a message", () => {
    const config = {
      onBeforeLinkClickSend: () => {
        return true;
      }
    };
    getLinkRegion.and.returnValue("root");
    getLinkName.and.returnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.and.returnValue(undefined);
    findSupportedAnchorElement.and.returnValue(supportedLinkElement);
    determineLinkType.and.returnValue("exit");

    const getLinkDetails = createGetLinkDetails({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findSupportedAnchorElement,
      determineLinkType,
      window: mockWindow
    });

    const result = getLinkDetails({ targetElement: {}, config, logger });
    expect(logger.info).toHaveBeenCalledWith(
      "This link click event is not triggered because the HTML element doesn't have an URL."
    );
    expect(result).toEqual(undefined);
  });

  it("Returns the object when callback does not return explicit false ", () => {
    const config = {
      onBeforeLinkClickSend: () => {}
    };
    getLinkRegion.and.returnValue("root");
    getLinkName.and.returnValue("Go to cart");
    getAbsoluteUrlFromAnchorElement.and.returnValue("http://blah.com");
    findSupportedAnchorElement.and.returnValue(supportedLinkElement);
    determineLinkType.and.returnValue("exit");

    const getLinkDetails = createGetLinkDetails({
      getLinkRegion,
      getLinkName,
      getAbsoluteUrlFromAnchorElement,
      findSupportedAnchorElement,
      determineLinkType,
      window: mockWindow
    });

    const result = getLinkDetails({ targetElement: {}, config, logger });
    expect(result).not.toBe(undefined);
  });
});
