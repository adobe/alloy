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
  createIframeClickHandler,
  displayHTMLContentInIframe
} from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayIframeContent";
import cleanUpDomChanges from "../../../../../helpers/cleanUpDomChanges";
import { getNonce } from "../../../../../../../src/components/Personalization/dom-actions/dom";

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

    it("should set 'nonce' attribute on script tag if it exists", async () => {
      const mockHtmlContentWithScript =
        "<!DOCTYPE html>\n" +
        "<html>\n" +
        "<head>\n" +
        "  <title>Bumper Sale!</title>\n" +
        "  <style>\n" +
        "  </style>\n" +
        "</head>\n" +
        "<body>\n" +
        '<div id="announcement">\n' +
        '  <a id ="cross" href="adbinapp://dismiss?interaction=cancel">&#10005;</a>\n' +
        "  <h2>Black Friday Sale!</h2>\n" +
        '   <img src="https://media3.giphy.com/media/kLhcBWs9Nza4hCW5IS/200.gif" alt="Technology Image">\n' +
        "  <p>Don't miss out on our incredible discounts and deals at our gadgets!</p>\n" +
        '  <div id="buttons">\n' +
        '    <a href="adbinapp://dismiss?interaction=https%3A%2F%2Fwww.nike.com%2Fw%2Fmens-jordan-clothing-37eefz6ymx6znik1">Shop</a>\n' +
        '    <a href="adbinapp://dismiss?interaction=cancel">Dismiss</a>\n' +
        "  </div>\n" +
        "</div>\n" +
        "<script>\n" +
        "  // Listen for a click on the button inside the iframe\n" +
        '  document.getElementById("buttons").addEventListener("click", handleButtonClick);\n' +
        '  document.getElementById("cross").addEventListener("click", handleButtonClick);\n' +
        "  function handleButtonClick(event) {\n" +
        '    console.log("A button was clicked with text ", event.target);\n' +
        '    const href = event.target.getAttribute("href");\n' +
        "    // Send a message to the parent page\n" +
        '    console.log("I am sending a message to the parent ", href);\n' +
        '    parent.postMessage({ "Element was clicked": href }, "*");\n' +
        "  }\n" +
        "</script>\n" +
        "</body>\n" +
        "</html>\n";

      const childElement = document.createElement("div");
      childElement.setAttribute("nonce", "1234");
      const parentElement = document.createElement("div");
      parentElement.appendChild(childElement);
      const originalGetNonce = getNonce(parentElement);

      const mockClickHandler = jasmine.createSpy("clickHandler");
      const iframe = createIframe(mockHtmlContentWithScript, mockClickHandler);

      const blob = await fetch(iframe.src).then(r => r.blob());
      const text = await blob.text();
      const parser = new DOMParser();
      const iframeDocument = parser.parseFromString(text, "text/html");

      const scriptTag = iframeDocument.querySelector("script");
      expect(scriptTag).toBeDefined();
      expect(scriptTag.getAttribute("nonce")).toBe(originalGetNonce);
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
  describe("displayHTMLContentInIframe", () => {
    let originalAppendChild;
    let originalBodyStyle;
    let mockCollect;
    let originalCreateContainerElement;
    let originalCreateIframe;
    let originalCreateOverlayElement;

    beforeEach(() => {
      mockCollect = jasmine.createSpy("collect");
      originalAppendChild = document.body.appendChild;
      document.body.appendChild = jasmine.createSpy("appendChild");
      originalBodyStyle = document.body.style;
      document.body.style = {};

      originalCreateContainerElement = window.createContainerElement;
      window.createContainerElement = jasmine
        .createSpy("createContainerElement")
        .and.callFake(() => {
          const element = document.createElement("div");
          element.id = "alloy-messaging-container";
          return element;
        });

      originalCreateIframe = window.createIframe;
      window.createIframe = jasmine
        .createSpy("createIframe")
        .and.callFake(() => {
          const element = document.createElement("iframe");
          element.id = "alloy-iframe-id";
          return element;
        });

      originalCreateOverlayElement = window.createOverlayElement;
      window.createOverlayElement = jasmine
        .createSpy("createOverlayElement")
        .and.callFake(() => {
          const element = document.createElement("div");
          element.id = "alloy-overlay-container";
          return element;
        });
    });

    afterEach(() => {
      document.body.appendChild = originalAppendChild;
      document.body.style = originalBodyStyle;
      document.body.innerHTML = "";
      window.createContainerElement = originalCreateContainerElement;
      window.createOverlayElement = originalCreateOverlayElement;
      window.createIframe = originalCreateIframe;
    });

    it("should display HTML content in iframe with overlay", () => {
      const settings = {
        type: "custom",
        mobileParameters: {
          verticalAlign: "center",
          dismissAnimation: "bottom",
          verticalInset: 20,
          backdropOpacity: 0.78,
          cornerRadius: 20,
          gestures: {},
          horizontalInset: -14,
          uiTakeover: true,
          horizontalAlign: "center",
          width: 72,
          displayAnimation: "bottom",
          backdropColor: "#4CA206",
          height: 63
        },
        webParameters: {
          info: "this is a placeholder"
        },
        content:
          '<!doctype html>\n<html>\n<head>\n  <title>Bumper Sale!</title>\n  <style>\n    body {\n      margin: 0;\n      padding: 0;\n      font-family: Arial, sans-serif;\n    }\n\n    #announcement {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background-color: rgba(0, 0, 0, 0.8);\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      color: #fff;\n    }\n\n    #announcement img {\n      max-width: 80%;\n      height: auto;\n      margin-bottom: 20px;\n    }\n\n    #cross {\n      position: absolute;\n      top: 10px;\n      right: 10px;\n      cursor: pointer;\n      font-size: 24px;\n      color: #fff;\n      text-decoration: none;\n    }\n\n    #buttons {\n      display: flex;\n      justify-content: center;\n      margin-top: 20px;\n    }\n\n    #buttons a {\n      margin: 0 10px;\n      padding: 10px 20px;\n      background-color: #ff5500;\n      color: #fff;\n      text-decoration: none;\n      border-radius: 4px;\n      font-weight: bold;\n      transition: background-color 0.3s ease;\n    }\n\n    #buttons a:hover {\n      background-color: #ff3300;\n    }\n  </style>\n</head>\n<body>\n<div id="announcement">\n  <a id="cross" href="adbinapp://dismiss?interaction=cancel">✕</a>\n  <h2>Black Friday Sale!</h2>\n   <img src="https://media3.giphy.com/media/kLhcBWs9Nza4hCW5IS/200.gif" alt="Technology Image">\n  <p>Don\'t miss out on our incredible discounts and deals at our gadgets!</p>\n  <div id="buttons">\n    <a href="adbinapp://dismiss?interaction=clicked&amp;link=https%3A%2F%2Fwww.nike.com%2Fw%2Fmens-jordan-clothing-37eefz6ymx6znik1">Shop</a>\n    <a href="adbinapp://dismiss?interaction=cancel">Dismiss</a>\n  </div>\n</div>\n<script>\n  // Listen for a click on the button inside the iframe\n  document.getElementById("buttons").addEventListener("click", handleButtonClick);\n  document.getElementById("cross").addEventListener("click", handleButtonClick);\n  function handleButtonClick(event) {\n    console.log("A button was clicked with text ", event.target);\n    const href = event.target.getAttribute("href");\n    // Send a message to the parent page\n    console.log("I am sending a message to the parent ", href);\n    parent.postMessage({ "Element was clicked": href }, "*");\n  }\n</script>\n\n</body></html>\n',
        contentType: "text/html",
        schema: "https://ns.adobe.com/personalization/in-app-message",
        meta: {
          id: "9441e3c4-d673-4c1b-8fb9-d1c0f7826dcc",
          scope: "mobileapp://com.adobe.iamTutorialiOS",
          scopeDetails: {
            decisionProvider: "AJO",
            correlationID: "8794bfb9-3254-478a-860e-04f9da59ad82",
            characteristics: {
              eventToken:
                "eyJtZXNzYWdlRXhlY3V0aW9uIjp7Im1lc3NhZ2VFeGVjdXRpb25JRCI6Ik5BIiwibWVzc2FnZUlEIjoiODc5NGJmYjktMzI1NC00NzhhLTg2MGUtMDRmOWRhNTlhZDgyIiwibWVzc2FnZVB1YmxpY2F0aW9uSUQiOiI1ZmYzZmM5Zi0zZTY2LTRiNzktODRmMS1kNzUzMGYwOWQ1ZTIiLCJtZXNzYWdlVHlwZSI6Im1hcmtldGluZyIsImNhbXBhaWduSUQiOiIyOGJlYTAxMS1lNTk2LTQ0MjktYjhmNy1iNWJkNjMwYzY3NDMiLCJjYW1wYWlnblZlcnNpb25JRCI6ImQ5OTQzODJhLTJjZDAtNDkwYS04NGM4LWM0NTk2NmMwYjYwZiIsImNhbXBhaWduQWN0aW9uSUQiOiJiNDU0OThjYi05NmQxLTQxN2EtODFlYi0yZjA5MTU3YWQ4YzYifSwibWVzc2FnZVByb2ZpbGUiOnsibWVzc2FnZVByb2ZpbGVJRCI6IjQ2MTg5Yjg1LWEwYTYtNDc4NS1hNmJlLTg4OWRiZjU3NjhiOSIsImNoYW5uZWwiOnsiX2lkIjoiaHR0cHM6Ly9ucy5hZG9iZS5jb20veGRtL2NoYW5uZWxzL2luQXBwIiwiX3R5cGUiOiJodHRwczovL25zLmFkb2JlLmNvbS94ZG0vY2hhbm5lbC10eXBlcy9pbkFwcCJ9fX0="
            },
            activity: {
              id:
                "28bea011-e596-4429-b8f7-b5bd630c6743#b45498cb-96d1-417a-81eb-2f09157ad8c6"
            }
          }
        }
      };

      displayHTMLContentInIframe(settings, mockCollect);

      expect(document.body.appendChild).toHaveBeenCalledTimes(2);
      expect(document.body.style.overflow).toBe("hidden");
    });
  });
});
