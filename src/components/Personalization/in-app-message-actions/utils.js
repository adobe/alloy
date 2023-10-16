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
import { startsWith } from "../../../utils";

export const addStyle = (styleTagId, cssText) => {
  const existingStyle = document.getElementById(styleTagId);
  if (existingStyle) {
    existingStyle.remove();
  }

  const styles = document.createElement("style");
  styles.id = styleTagId;

  styles.appendChild(document.createTextNode(cssText));
  document.head.appendChild(styles);
};

export const removeElements = cssClassName => {
  [...document.getElementsByClassName(cssClassName)].forEach(element => {
    if (!element) {
      return;
    }
    element.remove();
  });
};

export const parseAnchor = anchor => {
  const nothing = {};

  if (!anchor || anchor.tagName.toLowerCase() !== "a") {
    return nothing;
  }

  const { href } = anchor;
  if (!href || !startsWith(href, "adbinapp://")) {
    return nothing;
  }

  const hrefParts = href.split("?");

  const action = hrefParts[0].split("://")[1];
  const label = anchor.innerText;
  const uuid = anchor.getAttribute("data-uuid") || "";

  let interaction;
  let link;

  if (hrefParts.length > 1) {
    const queryParams = new URLSearchParams(hrefParts[1]);
    interaction = queryParams.get("interaction") || "";
    link = decodeURIComponent(queryParams.get("link") || "");
  }
  return {
    action,
    interaction,
    link,
    label,
    uuid
  };
};
