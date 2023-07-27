/* eslint-disable no-unused-vars */
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

import { removeElements } from "../utils";

const ELEMENT_TAG_CLASSNAME = "alloy-messaging-container";
const ELEMENT_TAG_ID = "alloy-messaging-container";
const ANCHOR_HREF_REGEX = /adbinapp:\/\/(\w+)\?interaction=(\w+)/i;

export const buildStyleFromParameters = (mobileParameters, webParameters) => {
  const {
    verticalAlign,
    width,
    horizontalAlign,
    backdropColor,
    height,
    cornerRadius,
    horizontalInset,
    verticalInset,
    uiTakeOver
  } = mobileParameters;

  return {
    verticalAlign: verticalAlign === "center" ? "middle" : verticalAlign,
    top: verticalAlign === "top" ? "0px" : "auto",
    width: width ? `${width}%` : "100%",
    horizontalAlign: horizontalAlign === "center" ? "middle" : horizontalAlign,
    backgroundColor: backdropColor || "rgba(0, 0, 0, 0.5)",
    height: height ? `${height}vh` : "100%",
    borderRadius: cornerRadius ? `${cornerRadius}px` : "0px",
    border: "none",
    marginLeft: horizontalInset ? `${horizontalInset}px` : "0px",
    marginRight: horizontalInset ? `${horizontalInset}px` : "0px",
    marginTop: verticalInset ? `${verticalInset}px` : "0px",
    marginBottom: verticalInset ? `${verticalInset}px` : "0px",
    zIndex: uiTakeOver ? "9999" : "0",
    position: uiTakeOver ? "fixed" : "relative",
    overflow: "hidden"
  };
};

const createIframeClickHandler = (container, collect) => {
  return event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const { target } = event;

    const anchor =
      target.tagName.toLowerCase() === "a" ? target : target.closest("a");

    if (anchor) {
      if (ANCHOR_HREF_REGEX.test(anchor.href)) {
        const matches = ANCHOR_HREF_REGEX.exec(anchor.href);

        const action = matches.length >= 2 ? matches[1] : "";
        const interaction = matches.length >= 3 ? matches[2] : "";

        if (interaction === "clicked") {
          const uuid = anchor.getAttribute("data-uuid");
          // eslint-disable-next-line no-console
          console.log(`clicked ${uuid}`);
          // TODO: collect analytics
          // collect({
          //   eventType: INTERACT
          // });
        }

        if (action === "dismiss") {
          container.remove();
        }
      } else {
        window.location.href = anchor.href;
      }
    }
  };
};

const createIframe = (htmlContent, clickHandler) => {
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(htmlContent, "text/html");

  const element = document.createElement("iframe");
  element.src = URL.createObjectURL(
    new Blob([htmlDocument.documentElement.outerHTML], { type: "text/html" })
  );
  // element.sandbox = "allow-same-origin allow-scripts";

  Object.assign(element.style, {
    border: "none",
    width: "100%",
    height: "100%"
  });

  element.addEventListener("load", () => {
    const { addEventListener } =
      element.contentDocument || element.contentWindow.document;
    addEventListener("click", clickHandler);
  });

  return element;
};

const createContainerElement = settings => {
  const { mobileParameters = {}, webParameters = {} } = settings;

  const element = document.createElement("div");
  element.id = ELEMENT_TAG_ID;
  element.className = `${ELEMENT_TAG_CLASSNAME}`;

  Object.assign(element.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    "background-color": "white",
    padding: "0px",
    border: "1px solid black",
    "box-shadow": "10px 10px 5px #888888"
  });

  Object.assign(
    element.style,
    buildStyleFromParameters(mobileParameters, webParameters)
  );

  return element;
};

const displayHTMLContentInIframe = (settings, collect) => {
  removeElements(ELEMENT_TAG_CLASSNAME);

  const { content, contentType } = settings;

  if (contentType !== "text/html") {
    // TODO: whoops, no can do.
  }

  const container = createContainerElement(settings);

  const iframe = createIframe(
    content,
    createIframeClickHandler(container, collect)
  );

  container.appendChild(iframe);

  document.body.append(container);
};

export default (settings, collect) => {
  return new Promise(resolve => {
    const { meta } = settings;

    displayHTMLContentInIframe(settings, collect);

    resolve({ meta });
  });
};
