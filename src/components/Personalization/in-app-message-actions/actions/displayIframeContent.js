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

import { getNonce } from "../../dom-actions/dom";
import { parseAnchor, removeElementById } from "../utils";
import { TEXT_HTML } from "../../constants/contentType";
import { INTERACT } from "../../constants/eventType";

const ELEMENT_TAG_CLASSNAME = "alloy-messaging-container";
const ELEMENT_TAG_ID = "alloy-messaging-container";

const OVERLAY_TAG_CLASSNAME = "alloy-overlay-container";
const OVERLAY_TAG_ID = "alloy-overlay-container";
const ALLOY_IFRAME_ID = "alloy-content-iframe";

const dismissMessage = () =>
  [ELEMENT_TAG_ID, OVERLAY_TAG_ID].forEach(removeElementById);

// eslint-disable-next-line no-unused-vars
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
    uiTakeover = false
  } = mobileParameters;

  const style = {
    width: width ? `${width}%` : "100%",
    backgroundColor: backdropColor || "rgba(0, 0, 0, 0.5)",
    borderRadius: cornerRadius ? `${cornerRadius}px` : "0px",
    border: "none",
    position: uiTakeover ? "fixed" : "relative",
    overflow: "hidden"
  };
  if (horizontalAlign === "left") {
    style.left = horizontalInset ? `${horizontalInset}%` : "0";
  } else if (horizontalAlign === "right") {
    style.right = horizontalInset ? `${horizontalInset}%` : "0";
  } else if (horizontalAlign === "center") {
    style.left = "50%";
    style.transform = "translateX(-50%)";
  }

  if (verticalAlign === "top") {
    style.top = verticalInset ? `${verticalInset}%` : "0";
  } else if (verticalAlign === "bottom") {
    style.position = "fixed";
    style.bottom = verticalInset ? `${verticalInset}%` : "0";
  } else if (verticalAlign === "center") {
    style.top = "50%";
    style.transform = `${
      horizontalAlign === "center" ? `${style.transform} ` : ""
    }translateY(-50%)`;
    style.display = "flex";
    style.alignItems = "center";
    style.justifyContent = "center";
  }

  if (height) {
    style.height = `${height}vh`;
  } else {
    style.height = "100%";
  }
  return style;
};

const setWindowLocationHref = link => {
  window.location.assign(link);
};

export const createIframeClickHandler = (
  interact,
  navigateToUrl = setWindowLocationHref
) => {
  return event => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const { target } = event;

    const anchor =
      target.tagName.toLowerCase() === "a" ? target : target.closest("a");

    if (!anchor) {
      return;
    }

    const { action, interaction, link, label, uuid } = parseAnchor(anchor);

    interact({
      label,
      id: interaction,
      uuid,
      link
    });

    if (action === "dismiss") {
      dismissMessage();
    }

    if (typeof link === "string" && link.length > 0) {
      navigateToUrl(link);
    }
  };
};

export const createIframe = (htmlContent, clickHandler) => {
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(htmlContent, TEXT_HTML);
  const scriptTag = htmlDocument.querySelector("script");

  if (scriptTag) {
    scriptTag.setAttribute("nonce", getNonce());
  }
  const element = document.createElement("iframe");
  element.src = URL.createObjectURL(
    new Blob([htmlDocument.documentElement.outerHTML], { type: TEXT_HTML })
  );
  element.id = ALLOY_IFRAME_ID;

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

export const createContainerElement = settings => {
  const { mobileParameters = {}, webParameters = {} } = settings;
  const element = document.createElement("div");
  element.id = ELEMENT_TAG_ID;
  element.className = `${ELEMENT_TAG_CLASSNAME}`;
  Object.assign(
    element.style,
    buildStyleFromParameters(mobileParameters, webParameters)
  );

  return element;
};

export const createOverlayElement = parameter => {
  const element = document.createElement("div");
  const backdropOpacity = parameter.backdropOpacity || 0.5;
  const backdropColor = parameter.backdropColor || "#FFFFFF";
  element.id = OVERLAY_TAG_ID;
  element.className = `${OVERLAY_TAG_CLASSNAME}`;

  Object.assign(element.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "transparent",
    opacity: backdropOpacity,
    backgroundColor: backdropColor
  });

  return element;
};

export const displayHTMLContentInIframe = (settings, interact) => {
  dismissMessage();
  const { content, contentType, mobileParameters } = settings;

  if (contentType !== TEXT_HTML) {
    return;
  }

  const container = createContainerElement(settings);

  const iframe = createIframe(content, createIframeClickHandler(interact));

  container.appendChild(iframe);

  if (mobileParameters.uiTakeover) {
    const overlay = createOverlayElement(mobileParameters);
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
  }
  document.body.appendChild(container);
};

export default (settings, collect) => {
  return new Promise(resolve => {
    const { meta } = settings;

    displayHTMLContentInIframe(settings, propositionAction => {
      collect({
        decisionsMeta: [meta],
        propositionAction,
        eventType: INTERACT
      });
    });

    resolve({ meta });
  });
};
