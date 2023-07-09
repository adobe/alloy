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
import displayCustom from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayCustom";

describe("displayCustom", () => {
  let setting;
  let collect;

  beforeEach(() => {
    setting = {
      type: "cjmiam",
      verticalAlign: "center",
      dismissAnimation: "bottom",
      verticalInset: 0,
      backdropOpacity: 0.2,
      cornerRadius: 15,
      horizontalInset: 0,
      uiTakeover: true,
      horizontalAlign: "center",
      width: "100",
      height: "100",
      content:
        '\u003c!doctype html\u003e\n\u003chtml\u003e\n\u003chead\u003e\n  \u003ctitle\u003eBumper Sale!\u003c/title\u003e\n  \u003cstyle\u003e\n    body {\n      margin: 0;\n      padding: 0;\n      font-family: Arial, sans-serif;\n    }\n\n    #announcement {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background-color: rgba(0, 0, 0, 0.8);\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      color: #fff;\n    }\n\n    #announcement img {\n      max-width: 80%;\n      height: auto;\n      margin-bottom: 20px;\n    }\n\n    #cross {\n      position: absolute;\n      top: 10px;\n      right: 10px;\n      cursor: pointer;\n      font-size: 24px;\n      color: #fff;\n    }\n\n    #buttons {\n      display: flex;\n      justify-content: center;\n      margin-top: 20px;\n    }\n\n    #buttons a {\n      margin: 0 10px;\n      padding: 10px 20px;\n      background-color: #ff5500;\n      color: #fff;\n      text-decoration: none;\n      border-radius: 4px;\n      font-weight: bold;\n      transition: background-color 0.3s ease;\n    }\n\n    #buttons a:hover {\n      background-color: #ff3300;\n    }\n  \u003c/style\u003e\n\u003c/head\u003e\n\u003cbody\u003e\n\u003cdiv id\u003d"announcement"\u003e\n  \u003ch2\u003eExplore the world!\u003c/h2\u003e\n  \u003cp\u003eDon\u0027t miss our discount on winter travel!\u003c/p\u003e\n  \u003cimg src\u003d"https://source.unsplash.com/800x600/?travel,vacation" alt\u003d"Travel Image"\u003e\n  \u003cdiv id\u003d"buttons"\u003e\n    \u003ca class\u003d"forward" href\u003d"http://localhost:3000/"\u003eBook Now\u003c/a\u003e\n    \u003ca class\u003d"dismiss"\u003eLater\u003c/a\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/body\u003e\u003c/html\u003e\n'
    };
  });

  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("should display the iframe container for banner display type", () => {
    setting.content =
      '\u003c!doctype html\u003e\n\u003chtml\u003e\n\u003chead\u003e\n    \u003ctitle\u003eSummer Sale Banner\u003c/title\u003e\n    \u003cstyle\u003e\n        /* CSS styles for the banner */\n        .banner {\n            position: fixed;\n            top: 0;\n            left: 0;\n            width: 100%;\n            background-color: #f1f1f1;\n            padding: 20px;\n            text-align: center;\n            z-index: 9999;\n        }\n\n        .close {\n            position: absolute;\n            top: 10px;\n            right: 50px;\n            font-size: 24px;\n            font-weight: bold;\n            cursor: pointer;\n        }\n    \u003c/style\u003e\n\u003c/head\u003e\n\u003cbody\u003e\n\u003cdiv class\u003d"banner"\u003e\n    \u003cspan class\u003d"close" onclick\u003d"closeBanner()"\u003ex\u003c/span\u003e\n    \u003ch2\u003eSummer Sale - Get 20% off!\u003c/h2\u003e\n    \u003cp\u003eDon\u0027t miss out on our amazing summer sale. Shop now and save big!\u003c/p\u003e\n\u003c/div\u003e\n\n\u003cscript\u003e\n    function closeBanner() {\n        // Send a message to the parent.html page\n        window.parent.postMessage("Banner closed", "*");\n\n        // Hide the banner\n        var banner \u003d document.querySelector(\u0027.banner\u0027);\n        banner.style.display \u003d \u0027none\u0027;\n    }\n\u003c/script\u003e\n\n\u003c/body\u003e\u003c/html\u003e\n';
    displayCustom(setting, collect);
    const divElement = document.body.firstChild;
    const styleAttr = divElement.getAttribute("style");
    const styleProperties = styleAttr
      .split(";")
      .map(property => property.trim());

    let verticalAlign;
    let top;
    let width;

    styleProperties.forEach(property => {
      const [propertyName, propertyValue] = property.split(":");
      if (propertyName.trim() === "vertical-align") {
        verticalAlign = propertyValue.trim();
      } else if (propertyName.trim() === "top") {
        top = propertyValue.trim();
      } else if (propertyName.trim() === "width") {
        width = propertyValue.trim();
      }
    });
    expect(verticalAlign).toBe("middle");
    expect(top).toBe("auto");
    expect(width).toBe("100%");
  });

  it("should display the iframe container for fullscreen display type", () => {
    setting.content =
      '\u003c!doctype html\u003e\n\u003chtml\u003e\n\u003chead\u003e\n  \u003ctitle\u003eBumper Sale!\u003c/title\u003e\n  \u003cstyle\u003e\n    body {\n      margin: 0;\n      padding: 0;\n      font-family: Arial, sans-serif;\n    }\n\n    #announcement {\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      background-color: rgba(0, 0, 0, 0.8);\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      color: #fff;\n    }\n\n    #announcement img {\n      max-width: 80%;\n      height: auto;\n      margin-bottom: 20px;\n    }\n\n    #cross {\n      position: absolute;\n      top: 10px;\n      right: 10px;\n      cursor: pointer;\n      font-size: 24px;\n      color: #fff;\n    }\n\n    #buttons {\n      display: flex;\n      justify-content: center;\n      margin-top: 20px;\n    }\n\n    #buttons a {\n      margin: 0 10px;\n      padding: 10px 20px;\n      background-color: #ff5500;\n      color: #fff;\n      text-decoration: none;\n      border-radius: 4px;\n      font-weight: bold;\n      transition: background-color 0.3s ease;\n    }\n\n    #buttons a:hover {\n      background-color: #ff3300;\n    }\n  \u003c/style\u003e\n\u003c/head\u003e\n\u003cbody\u003e\n\u003cdiv id\u003d"announcement" class\u003d"fullscreen"\u003e\n  \u003cspan id\u003d"cross" class\u003d"dismiss"\u003e✕\u003c/span\u003e\n  \u003ch2\u003eBlack Friday Sale!\u003c/h2\u003e\n  \u003cimg src\u003d"https://source.unsplash.com/800x600/?technology,gadget" alt\u003d"Technology Image"\u003e\n  \u003cp\u003eDon\u0027t miss out on our incredible discounts and deals at our gadgets!\u003c/p\u003e\n  \u003cdiv id\u003d"buttons"\u003e\n    \u003ca class\u003d"forward" href\u003d"http://localhost:3000/"\u003eShop\u003c/a\u003e\n    \u003ca class\u003d"dismiss"\u003eDismiss\u003c/a\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n\n\u003c/body\u003e\u003c/html\u003e\n';
    displayCustom(setting, collect);

    const divElement = document.body.lastChild;
    const styleAttr = divElement.getAttribute("style");
    const styleProperties = styleAttr
      .split(";")
      .map(property => property.trim());

    let position;
    let top;
    let left;
    let height;
    let width;

    styleProperties.forEach(property => {
      const [propertyName, propertyValue] = property.split(":");
      if (propertyName.trim() === "position") {
        position = propertyValue.trim();
      } else if (propertyName.trim() === "top") {
        top = propertyValue.trim();
      } else if (propertyName.trim() === "left") {
        left = propertyValue.trim();
      } else if (propertyName.trim() === "height") {
        height = propertyValue.trim();
      } else if (propertyName.trim() === "width") {
        width = propertyValue.trim();
      }
    });
    expect(position).toBe("fixed");
    expect(height).toBe("100%");
    expect(top).toBe("0px");
    expect(left).toBe("0px");
    expect(width).toBe("100%");
  });

  it("should display the iframe container for other display types as modal", () => {
    setting.content = "Other content";
    displayCustom(setting, collect);

    const divElement = document.body.lastChild;
    const styleAttr = divElement.getAttribute("style");
    const styleProperties = styleAttr
      .split(";")
      .map(property => property.trim());

    let verticalAlign;
    let top;
    let width;

    styleProperties.forEach(property => {
      const [propertyName, propertyValue] = property.split(":");
      if (propertyName.trim() === "vertical-align") {
        verticalAlign = propertyValue.trim();
      } else if (propertyName.trim() === "top") {
        top = propertyValue.trim();
      } else if (propertyName.trim() === "width") {
        width = propertyValue.trim();
      }
    });
    expect(verticalAlign).toBe("middle");
    expect(top).toBe("auto");
    expect(width).toBe("50%");
  });

  it("should remove iframeContainer when clicking on element with className 'dismiss'", () => {
    const eventTarget = document.createElement("div");
    eventTarget.className = "dismiss";

    displayCustom(setting, collect);
    document.body.lastChild.dispatchEvent(
      new Event("click", { target: eventTarget })
    );
    setTimeout(() => {
      expect(document.body.lastChild).toBe(false);
    }, 5000);
  });

  it("should remove iframeContainer when clicking on element with className 'close'", () => {
    const eventTarget = document.createElement("div");
    eventTarget.className = "close";
    displayCustom(setting, collect);
    document.body.lastChild.dispatchEvent(
      new Event("click", { target: eventTarget })
    );
    setTimeout(() => {
      expect(document.body.lastChild).toBe(false);
    }, 5000);
  });
});
