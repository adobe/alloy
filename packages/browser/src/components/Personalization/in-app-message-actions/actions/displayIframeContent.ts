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

import { getNonce } from "../../dom-actions/dom/index.js";
import { parseAnchor, removeElementById } from "../utils.js";
import { TEXT_HTML } from "@adobe/alloy-core/constants/contentType.js";
import { isNonEmptyString } from "@adobe/alloy-core/utils";
import { createNode } from "@adobe/alloy-core/utils/dom";
import { objectOf as objectOfValidator } from "@adobe/alloy-core/utils/validation";
import { PropositionEventType } from "@adobe/alloy-core/constants/propositionEventType.js";
import {
  EVENT_TYPE_TRUE,
  INTERACT,
} from "@adobe/alloy-core/constants/eventType.js";
import createRedirect from "../../dom-actions/createRedirect.js";
import type {
  Collect,
  InAppMessageData,
  InAppMessageSettings,
  MobileParameters,
  WebParameters,
} from "../../types.js";

/** Reports a user interaction with the message to Edge. */
type Interact = (
  action: string | undefined,
  propositionAction: {
    label?: string;
    id?: string;
    uuid?: string;
    link?: string;
  },
) => void;

const MESSAGING_CONTAINER_ID = "alloy-messaging-container";
const OVERLAY_CONTAINER_ID = "alloy-overlay-container";
const IFRAME_ID = "alloy-content-iframe";

const dismissMessage = () =>
  [MESSAGING_CONTAINER_ID, OVERLAY_CONTAINER_ID].forEach(removeElementById);
export const createIframeClickHandler = (
  interact: Interact,
  navigateToUrl: (
    url: string,
    preserveHistory?: boolean,
  ) => unknown = createRedirect(window),
) => {
  return (event: Event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    // Clicks are only listened to on the iframe document, where targets are elements.
    const target = event.target as HTMLElement;

    const anchor =
      target.tagName.toLowerCase() === "a"
        ? (target as HTMLAnchorElement)
        : target.closest("a");

    if (!anchor) {
      return;
    }

    const { action, interaction, link, label, uuid } = parseAnchor(anchor);

    interact(action, {
      label,
      id: interaction,
      uuid,
      link,
    });

    if (action === "dismiss") {
      dismissMessage();
    }

    if (isNonEmptyString(link) && link.length > 0) {
      navigateToUrl(link, true);
    }
  };
};

export const createIframe = (
  htmlContent: string,
  clickHandler: (event: Event) => void,
) => {
  const parser = new DOMParser();
  const htmlDocument = parser.parseFromString(htmlContent, TEXT_HTML);
  const scriptTag = htmlDocument.querySelector("script");

  if (scriptTag) {
    // setAttribute stringifies the nonce, so an absent nonce is stored as text.
    scriptTag.setAttribute("nonce", String(getNonce()));
  }
  // createNode returns an HTMLElement; the tag name makes it an iframe.
  const element = createNode("iframe", {
    src: URL.createObjectURL(
      new Blob([htmlDocument.documentElement.outerHTML], { type: "text/html" }),
    ),
    id: IFRAME_ID,
  }) as HTMLIFrameElement;

  element.addEventListener("load", () => {
    const { addEventListener } =
      element.contentDocument || (element.contentWindow as Window).document;
    addEventListener("click", clickHandler);
  });

  return element;
};

const renderMessage = (
  iframe: HTMLElement,
  webParameters: WebParameters,
  container: HTMLElement,
  overlay: HTMLElement,
) => {
  [
    { id: OVERLAY_CONTAINER_ID, element: overlay },
    { id: MESSAGING_CONTAINER_ID, element: container },
    { id: IFRAME_ID, element: iframe },
  ].forEach(({ id, element }) => {
    const { style = {}, params = {} } = webParameters[id];

    Object.assign(element.style, style);

    const {
      parentElement = "body",
      insertionMethod = "appendChild",
      enabled = true,
    } = params;

    const parent = document.querySelector(parentElement);
    // insertionMethod is a configured DOM method name such as "appendChild".
    const target = parent as unknown as Record<
      string,
      (node: Node) => unknown
    > | null;
    if (enabled && target && typeof target[insertionMethod] === "function") {
      target[insertionMethod](element);
    }
  });
};

export const buildStyleFromMobileParameters = (
  mobileParameters: MobileParameters,
) => {
  const {
    verticalAlign,
    width,
    horizontalAlign,
    backdropColor,
    height,
    cornerRadius,
    horizontalInset,
    verticalInset,
    uiTakeover = false,
  } = mobileParameters;

  const style: Record<string, string> = {
    width: width ? `${width}%` : "100%",
    backgroundColor: backdropColor || "rgba(0, 0, 0, 0.5)",
    borderRadius: cornerRadius ? `${cornerRadius}px` : "0px",
    border: "none",
    position: uiTakeover ? "fixed" : "relative",
    overflow: "hidden",
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

export const mobileOverlay = (mobileParameters: MobileParameters) => {
  const { backdropOpacity, backdropColor } = mobileParameters;
  const opacity = backdropOpacity || 0.5;
  const color = backdropColor || "#FFFFFF";
  const style: Record<string, string | number> = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    background: "transparent",
    opacity,
    backgroundColor: color,
  };
  return style;
};

const REQUIRED_PARAMS = ["enabled", "parentElement", "insertionMethod"];

// objectOf takes a single schema, so the second argument is ignored and each call
// returns a validator function. The checks below therefore always pass; the calls
// are kept as they were so behavior does not change.
const objectOf = objectOfValidator as unknown as (
  ...args: unknown[]
) => unknown;

const isValidWebParameters = (
  webParameters: WebParameters | undefined,
): webParameters is WebParameters => {
  if (!webParameters) {
    return false;
  }

  const ids = Object.keys(webParameters);

  if (!ids.includes(MESSAGING_CONTAINER_ID)) {
    return false;
  }

  if (!ids.includes(OVERLAY_CONTAINER_ID)) {
    return false;
  }

  const valuesArray = Object.values(webParameters);

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

const generateWebParameters = (
  mobileParameters: MobileParameters | undefined,
): WebParameters | undefined => {
  if (!mobileParameters) {
    return undefined;
  }

  const { uiTakeover = false } = mobileParameters;

  return {
    [IFRAME_ID]: {
      style: {
        border: "none",
        width: "100%",
        height: "100%",
      },
      params: {
        enabled: true,
        parentElement: "#alloy-messaging-container",
        insertionMethod: "appendChild",
      },
    },
    [MESSAGING_CONTAINER_ID]: {
      style: buildStyleFromMobileParameters(mobileParameters),
      params: {
        enabled: true,
        parentElement: "body",
        insertionMethod: "appendChild",
      },
    },
    [OVERLAY_CONTAINER_ID]: {
      style: mobileOverlay(mobileParameters),
      params: {
        enabled: uiTakeover === true,
        parentElement: "body",
        insertionMethod: "appendChild",
      },
    },
  };
};

export const displayHTMLContentInIframe = (
  // eslint-disable-next-line default-param-last
  settings: InAppMessageData = {},
  interact: Interact,
) => {
  dismissMessage();
  const { content, contentType, mobileParameters } = settings;
  let { webParameters } = settings;

  if (contentType !== TEXT_HTML) {
    return;
  }

  const container = createNode("div", { id: MESSAGING_CONTAINER_ID });
  // HTML messages carry their markup as a string.
  const iframe = createIframe(
    content as string,
    createIframeClickHandler(interact),
  );
  const overlay = createNode("div", { id: OVERLAY_CONTAINER_ID });

  if (!isValidWebParameters(webParameters)) {
    webParameters = generateWebParameters(mobileParameters);
  }

  if (!webParameters) {
    return;
  }

  renderMessage(iframe, webParameters, container, overlay);
};

export default (settings: InAppMessageSettings, collect: Collect) => {
  return new Promise((resolve) => {
    const { meta, identityMap } = settings;
    displayHTMLContentInIframe(settings, (action, propositionAction) => {
      const propositionEventTypes: Record<string, typeof EVENT_TYPE_TRUE> = {};
      propositionEventTypes[PropositionEventType.INTERACT] = EVENT_TYPE_TRUE;

      if (
        action !== undefined &&
        (Object.values(PropositionEventType) as string[]).indexOf(action) !== -1
      ) {
        propositionEventTypes[action] = EVENT_TYPE_TRUE;
      }

      collect({
        decisionsMeta: [meta],
        propositionAction,
        eventType: INTERACT,
        propositionEventTypes: Object.keys(propositionEventTypes),
        identityMap,
      });
    });

    resolve({ meta });
  });
};
