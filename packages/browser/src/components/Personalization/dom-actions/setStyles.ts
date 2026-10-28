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

import type { DecorateProposition } from "../types.js";

/** Style properties to apply, plus an optional CSS `priority` such as "important". */
type StyleContent = { priority?: string } & Record<string, string | number>;

import { setStyle } from "./dom/index.js";

export default (
  container: Element,
  styles: StyleContent,
  decorateProposition: DecorateProposition,
) => {
  const { priority, ...style } = styles;

  Object.keys(style).forEach((key) => {
    setStyle(container, key, style[key], priority);
  });

  decorateProposition(container);
};
