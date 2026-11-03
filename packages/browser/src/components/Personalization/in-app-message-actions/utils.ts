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

import { isNonEmptyArray, queryString } from "@adobe/alloy-core/utils";
import { removeNode, selectNodes } from "@adobe/alloy-core/utils/dom";
import decodeUriComponentSafely from "@adobe/alloy-core/utils/decodeUriComponentSafely.js";

export const removeElementById = (id: string) => {
  const element = selectNodes(`#${id}`, document);
  if (element && element.length > 0) {
    removeNode(element[0]);
  }
};
// A parameter repeated in the query parses to an array; the first value wins.
const firstValue = (value: string | string[] | null | undefined) =>
  Array.isArray(value) ? value[0] : value;

export const parseAnchor = (anchor: HTMLAnchorElement | null | undefined) => {
  const nothing: {
    action?: string;
    interaction?: string;
    link?: string;
    label?: string;
    uuid?: string;
  } = {};

  if (!anchor || anchor.tagName.toLowerCase() !== "a") {
    return nothing;
  }

  const { href } = anchor;
  if (!href || !href.startsWith("adbinapp://")) {
    return nothing;
  }

  const hrefParts = href.split("?");

  const action = hrefParts[0].split("://")[1];
  const label = anchor.innerText;
  const uuid = anchor.getAttribute("data-uuid") || "";

  let interaction: string | undefined;
  let link: string | undefined;

  if (isNonEmptyArray(hrefParts)) {
    const queryParams = queryString.parse(hrefParts[1]);
    interaction = firstValue(queryParams.interaction) || "";
    link = decodeUriComponentSafely(firstValue(queryParams.link) || "");
  }
  return {
    action,
    interaction,
    link,
    label,
    uuid,
  };
};
