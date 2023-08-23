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
import {
  buildStyleFromParameters,
  createOverlayElement,
  createIframe,
  createIframeClickHandler
} from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayIframeContent";
import cleanUpDomChanges from "../../../../../helpers/cleanUpDomChanges";

describe("DOM Actions on Iframe", () => {
  beforeEach(() => {
    cleanUpDomChanges("alloy-messaging-container");
    cleanUpDomChanges("alloy-overlay-container");
    cleanUpDomChanges("alloy-iframe-id");
  });

  afterEach(() => {
    cleanUpDomChanges("alloy-messaging-container");
    cleanUpDomChanges("alloy-overlay-container");
    cleanUpDomChanges("alloy-iframe-id");
  });

  describe("buildStyleFromParameters", () => {
    it("should build the style object correctly", () => {
      const mobileParameters = {
        verticalAlign: "center",
        width: 80,
        horizontalAlign: "left",
        backdropColor: "rgba(0, 0, 0, 0.7)",
        height: 60,
        cornerRadius: 10,
        horizontalInset: 5,
        verticalInset: 10,
        uiTakeover: true
      };

      const webParameters = {};

      const style = buildStyleFromParameters(mobileParameters, webParameters);

      expect(style.width).toBe("80%");
      expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0.7)");
      expect(style.borderRadius).toBe("10px");
      expect(style.border).toBe("none");
      expect(style.zIndex).toBe("9999");
      expect(style.position).toBe("fixed");
      expect(style.overflow).toBe("hidden");
      expect(style.left).toBe("5%");
      expect(style.height).toBe("60vh");
    });
  });

  describe("createOverlayElement", () => {
    it("should create overlay element with correct styles", () => {
      const parameter = {
        backdropOpacity: 0.8,
        backdropColor: "#000000"
      };

      const overlayElement = createOverlayElement(parameter);

      expect(overlayElement.id).toBe("alloy-overlay-container");
      expect(overlayElement.style.position).toBe("fixed");
      expect(overlayElement.style.top).toBe("0px");
      expect(overlayElement.style.left).toBe("0px");
      expect(overlayElement.style.width).toBe("100%");
      expect(overlayElement.style.height).toBe("100%");
      expect(overlayElement.style.zIndex).toBe("1");
      expect(overlayElement.style.background).toBe("rgb(0, 0, 0)");
      expect(overlayElement.style.opacity).toBe("0.8");
      expect(overlayElement.style.backgroundColor).toBe("rgb(0, 0, 0)");
    });
  });
  describe("createIframe function", () => {
    it("should create an iframe element with specified properties", () => {
      const mockHtmlContent =
        '\u003c!doctype html\u003e\\n\u003chtml\u003e\\n\u003chead\u003e\\n  \u003ctitle\u003eBumper Sale!\u003c/title\u003e\\n  \u003cstyle\u003e\\n    body {\\n      margin: 0;\\n      padding: 0;\\n      font-family: Arial, sans-serif;\\n    }\\n\\n    #announcement {\\n      position: fixed;\\n      top: 0;\\n      left: 0;\\n      width: 100%;\\n      height: 100%;\\n      background-color: rgba(0, 0, 0, 0.8);\\n      display: flex;\\n      flex-direction: column;\\n      align-items: center;\\n      justify-content: center;\\n      color: #fff;\\n    }\\n\\n    #announcement img {\\n      max-width: 80%;\\n      height: auto;\\n      margin-bottom: 20px;\\n    }\\n\\n    #cross {\\n      position: absolute;\\n      top: 10px;\\n      right: 10px;\\n      cursor: pointer;\\n      font-size: 24px;\\n      color: #fff;\\n    }\\n\\n    #buttons {\\n      display: flex;\\n      justify-content: center;\\n      margin-top: 20px;\\n    }\\n\\n    #buttons a {\\n      margin: 0 10px;\\n      padding: 10px 20px;\\n      background-color: #ff5500;\\n      color: #fff;\\n      text-decoration: none;\\n      border-radius: 4px;\\n      font-weight: bold;\\n      transition: background-color 0.3s ease;\\n    }\\n\\n    #buttons a:hover {\\n      background-color: #ff3300;\\n    }\\n  \u003c/style\u003e\\n\u003c/head\u003e\\n\u003cbody\u003e\\n\u003cdiv id\u003d"announcement" class\u003d"fullscreen"\u003e\\n  \u003cspan id\u003d"cross" class\u003d"dismiss"\u003e✕\u003c/span\u003e\\n  \u003ch2\u003eBlack Friday Sale!\u003c/h2\u003e\\n  \u003cimg src\u003d"https://source.unsplash.com/800x600/?technology,gadget" alt\u003d"Technology Image"\u003e\\n  \u003cp\u003eDon\u0027t miss out on our incredible discounts and deals at our gadgets!\u003c/p\u003e\\n  \u003cdiv id\u003d"buttons"\u003e\\n    \u003ca class\u003d"forward" href\u003d"http://localhost:3000/"\u003eShop\u003c/a\u003e\\n    \u003ca class\u003d"dismiss"\u003eDismiss\u003c/a\u003e\\n  \u003c/div\u003e\\n\u003c/div\u003e\\n\\n\u003c/body\u003e\u003c/html\u003e\\n';
      const mockClickHandler = jasmine.createSpy("clickHandler");

      const iframe = createIframe(mockHtmlContent, mockClickHandler);

      expect(iframe).toBeDefined();
      expect(iframe instanceof HTMLIFrameElement).toBe(true);
      expect(iframe.src).toContain("blob:");
      expect(iframe.style.border).toBe("none");
      expect(iframe.style.width).toBe("100%");
      expect(iframe.style.height).toBe("100%");
    });
  });

  describe("createIframeClickHandler", () => {
    let container;
    let mockedCollect;
    let mobileParameters;

    beforeEach(() => {
      container = document.createElement("div");
      container.setAttribute("id", "alloy-messaging-container");
      document.body.appendChild(container);

      mockedCollect = jasmine.createSpy("collect");

      mobileParameters = {
        verticalAlign: "center",
        width: 80,
        horizontalAlign: "left",
        backdropColor: "rgba(0, 0, 0, 0.7)",
        height: 60,
        cornerRadius: 10,
        horizontalInset: 5,
        verticalInset: 10
      };
    });

    it("should remove display message when dismiss is clicked and UI takeover is false", () => {
      Object.assign(mobileParameters, {
        uiTakeover: false
      });

      const anchor = document.createElement("a");
      Object.assign(anchor, {
        "data-uuid": "12345",
        href: "adbinapp://dismiss?interaction=cancel"
      });

      const mockEvent = {
        target: anchor,
        preventDefault: () => {},
        stopImmediatePropagation: () => {}
      };
      const iframeClickHandler = createIframeClickHandler(
        container,
        mockedCollect,
        mobileParameters
      );
      iframeClickHandler(mockEvent);
      const alloyMessagingContainer = document.getElementById(
        "alloy-messaging-container"
      );
      expect(alloyMessagingContainer).toBeNull();
    });

    it("should remove display message when dismiss is clicked and Ui takeover is true", () => {
      Object.assign(mobileParameters, {
        uiTakeover: true
      });

      const overlayContainer = document.createElement("div");
      overlayContainer.setAttribute("id", "alloy-overlay-container");
      document.body.appendChild(overlayContainer);

      const anchor = document.createElement("a");
      Object.assign(anchor, {
        "data-uuid": "12345",
        href: "adbinapp://dismiss?interaction=cancel"
      });
      const mockEvent = {
        target: anchor,
        preventDefault: () => {},
        stopImmediatePropagation: () => {}
      };
      const iframeClickHandler = createIframeClickHandler(
        container,
        mockedCollect,
        mobileParameters
      );
      iframeClickHandler(mockEvent);
      const overlayContainerAfterDismissal = document.getElementById(
        "alloy-overlay-container"
      );
      expect(overlayContainerAfterDismissal).toBeNull();
    });
  });
});
