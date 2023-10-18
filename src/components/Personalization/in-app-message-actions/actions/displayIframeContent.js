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
import { parseAnchor } from "../utils";
import { TEXT_HTML } from "../../../../constants/contentType";
import { assign, includes, values } from "../../../../utils";
import { createNode, removeNode } from "../../../../utils/dom";
import { objectOf } from "../../../../utils/validation";
import { PropositionEventType } from "../../../../constants/propositionEventType";
import { INTERACT } from "../../../../constants/eventType";

const ALLOY_MESSAGING_CONTAINER_ID = "alloy-messaging-container";
const ALLOY_OVERLAY_CONTAINER_ID = "alloy-overlay-container";
const ALLOY_IFRAME_ID = "alloy-content-iframe";

export const dismissMessage = () => {
  const elementIdsToRemove = [
    ALLOY_MESSAGING_CONTAINER_ID,
    ALLOY_OVERLAY_CONTAINER_ID
  ];

  elementIdsToRemove.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      removeNode(element);
    }
  });
};
const setWindowLocationHref = link => {
  window.location.href = link;
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

    interact(action, {
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
  const element = createNode("iframe", {
    src: URL.createObjectURL(
      new Blob([htmlDocument.documentElement.outerHTML], { type: "text/html" })
    ),
    id: ALLOY_IFRAME_ID
  });

  element.addEventListener("load", () => {
    const { addEventListener } =
      element.contentDocument || element.contentWindow.document;
    addEventListener("click", clickHandler);
  });

  return element;
};

const renderMessage = (iframe, webParameters, container, overlay) => {
  [
    { id: ALLOY_OVERLAY_CONTAINER_ID, element: overlay },
    { id: ALLOY_MESSAGING_CONTAINER_ID, element: container },
    { id: ALLOY_IFRAME_ID, element: iframe }
  ].forEach(({ id, element }) => {
    const { style = {}, params = {} } = webParameters[id];

    assign(element.style, style);

    const {
      parentElement = "body",
      insertionMethod = "appendChild",
      enabled = true
    } = params;

    const parent = document.querySelector(parentElement);
    if (enabled && parent && typeof parent[insertionMethod] === "function") {
      parent[insertionMethod](element);
    }
  });
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

export const mobileOverlay = mobileParameters => {
  const { backdropOpacity, backdropColor } = mobileParameters;
  const opacity = backdropOpacity || 0.5;
  const color = backdropColor || "#FFFFFF";
  const style = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "transparent",
    opacity,
    backgroundColor: color
  };
  return style;
};

const REQUIRED_PARAMS = ["enabled", "parentElement", "insertionMethod"];

const isValidWebParameters = webParameters => {
  if (!webParameters) {
    return false;
  }

  const ids = Object.keys(webParameters);

  if (!includes(ids, ALLOY_MESSAGING_CONTAINER_ID)) {
    return false;
  }

  if (!includes(ids, ALLOY_OVERLAY_CONTAINER_ID)) {
    return false;
  }

  const valuesArray = values(webParameters);

  for (let i = 0; i < valuesArray.length; i += 1) {
    if (!objectOf(valuesArray[i], "style")) {
      return false;
    }

    if (!objectOf(valuesArray[i], "params")) {
      return false;
    }

    for (let j = 0; j < REQUIRED_PARAMS.length; j += 1) {
      if (!objectOf(valuesArray[i].params, REQUIRED_PARAMS[j])) {
        return false;
      }
    }
  }

  return true;
};

const generateWebParameters = mobileParameters => {
  if (!mobileParameters) {
    return undefined;
  }

  const { uiTakeover = false } = mobileParameters;

  return {
    [ALLOY_IFRAME_ID]: {
      style: {
        border: "none",
        width: "100%",
        height: "100%"
      },
      params: {
        enabled: true,
        parentElement: "#alloy-messaging-container",
        insertionMethod: "appendChild"
      }
    },
    [ALLOY_MESSAGING_CONTAINER_ID]: {
      style: buildStyleFromMobileParameters(mobileParameters),
      params: {
        enabled: true,
        parentElement: "body",
        insertionMethod: "appendChild"
      }
    },
    [ALLOY_OVERLAY_CONTAINER_ID]: {
      style: mobileOverlay(mobileParameters),
      params: {
        enabled: uiTakeover === true,
        parentElement: "body",
        insertionMethod: "appendChild"
      }
    }
  };
};

export const displayHTMLContentInIframe = (settings = {}, interact) => {
  dismissMessage();
  const { content, contentType, mobileParameters } = settings;
  let { webParameters } = settings;

  if (contentType !== TEXT_HTML) {
    return;
  }

  const container = createNode("div", { id: ALLOY_MESSAGING_CONTAINER_ID });
  const iframe = createIframe(content, createIframeClickHandler(interact));
  const overlay = createNode("div", { id: ALLOY_OVERLAY_CONTAINER_ID });

  if (!isValidWebParameters(webParameters)) {
    webParameters = generateWebParameters(mobileParameters);
  }

  if (!webParameters) {
    return;
  }

  renderMessage(iframe, webParameters, container, overlay);
};

export default (settings, collect) => {
  return new Promise(resolve => {
    const { meta } = settings;
    displayHTMLContentInIframe(settings, (action, propositionAction) => {
      const propositionEventTypes = new Set();
      propositionEventTypes.add(PropositionEventType.INTERACT);

      if (Object.values(PropositionEventType).indexOf(action) !== -1) {
        propositionEventTypes.add(action);
      }

      collect({
        decisionsMeta: [meta],
        propositionAction,
        eventType: INTERACT,
        propositionEventTypes: Array.from(propositionEventTypes)
      });
    });

    resolve({ meta });
  });
};
