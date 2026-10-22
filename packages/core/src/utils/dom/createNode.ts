/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import appendNode from "./appendNode.js";
import isObject from "../isObject.js";

type Props = Record<string, unknown>;

const populateElementProperties = (element: HTMLElement, props: Props) => {
  Object.keys(props).forEach((key) => {
    // The following is to support setting style properties to avoid CSP errors.
    if (key === "style" && isObject(props[key])) {
      const styleProps = props[key] as Record<string, string>;
      Object.keys(styleProps).forEach((styleKey) => {
        (element.style as unknown as Record<string, string>)[styleKey] =
          styleProps[styleKey];
      });
    } else {
      (element as unknown as Props)[key] = props[key];
    }
  });
};

export default (
  tag: string,
  attrs: Record<string, string | number | boolean> = {},
  props: Props = {},
  children: Node[] = [],
  doc: Document = document,
): HTMLElement => {
  const result = doc.createElement(tag);
  Object.keys(attrs).forEach((key) => {
    // TODO: To highlight CSP problems consider throwing a descriptive error
    //       if nonce is available and key is style.
    result.setAttribute(key, attrs[key] as string);
  });
  populateElementProperties(result, props);
  children.forEach((child) => appendNode(result, child));
  return result;
};
