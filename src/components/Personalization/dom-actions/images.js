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

import { createNode, selectNodes } from "../../../utils/dom/index.js";
import { IMG } from "../../../constants/tagName.js";
import { SRC } from "../../../constants/elementAttribute.js";
import { getAttribute } from "./dom/index.js";

export const isImage = (element) => element.tagName === IMG;

export const loadImage = (url) => {
  return createNode(IMG, { src: url });
};

export const loadImages = (fragment) => {
  const images = selectNodes(IMG, fragment);

  images.forEach((image) => {
    const url = getAttribute(image, SRC);

    if (url) {
      loadImage(url);
    }
  });
};
