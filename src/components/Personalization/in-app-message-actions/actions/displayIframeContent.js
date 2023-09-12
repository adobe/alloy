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

const ALLOY_MESSAGING_CONTAINER_ID = "alloy-messaging-container";
const ALLOY_OVERLAY_CONTAINER_ID = "alloy-overlay-container";
const ALLOY_IFRAME_ID = "alloy-content-iframe";

const dismissMessage = () =>
  [ALLOY_MESSAGING_CONTAINER_ID, ALLOY_OVERLAY_CONTAINER_ID].forEach(
    removeElementById
  );

export const createElement = elementTagId => {
  const element = document.createElement("div");
  element.id = elementTagId;
  return element;
};

export const buildStyleFromMobileParameters = mobileParameters => {
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
  element.addEventListener("load", () => {
    const { addEventListener } =
      element.contentDocument || element.contentWindow.document;
    addEventListener("click", clickHandler);
  });

  return element;
};

export const displayHTMLContentInIframe = (settings, interact) => {
  dismissMessage();
  const { content, contentType, mobileParameters, webParameters } = settings;

  if (contentType !== TEXT_HTML) {
    return;
  }

  const container = createElement(ALLOY_MESSAGING_CONTAINER_ID);

  const iframe = createIframe(content, createIframeClickHandler(interact));

  const overlay = createElement(ALLOY_OVERLAY_CONTAINER_ID);

  container.appendChild(iframe);
  if (webParameters && webParameters.info !== "this is a placeholder") {
    Object.assign(iframe.style, webParameters[ALLOY_IFRAME_ID].style);
    Object.assign(
      container.style,
      webParameters[ALLOY_MESSAGING_CONTAINER_ID].style
    );
    if (webParameters[ALLOY_OVERLAY_CONTAINER_ID].params.enabled) {
      Object.assign(
        overlay.style,
        webParameters[ALLOY_OVERLAY_CONTAINER_ID].style
      );
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
    }
    const parentElementSelector =
      webParameters[ALLOY_MESSAGING_CONTAINER_ID].params.parentElement;
    if (parentElementSelector) {
      const parentElement = document.querySelector(parentElementSelector);
      if (parentElement) {
        parentElement[
          webParameters[ALLOY_MESSAGING_CONTAINER_ID].params.insertionMethod
        ](container);
      } else {
        document.body.appendChild(container);
      }
    }
  } else {
    Object.assign(iframe.style, {
      border: "none",
      width: "100%",
      height: "100%"
    });
    Object.assign(
      container.style,
      buildStyleFromMobileParameters(mobileParameters)
    );
    if (mobileParameters.uiTakeover) {
      const backdropOpacity = mobileParameters.backdropOpacity || 0.5;
      const backdropColor = mobileParameters.backdropColor || "#FFFFFF";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "transparent",
        opacity: backdropOpacity,
        backgroundColor: backdropColor
      });
      document.body.appendChild(overlay);
      document.body.style.overflow = "hidden";
    }
    document.body.appendChild(container);
  }
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
