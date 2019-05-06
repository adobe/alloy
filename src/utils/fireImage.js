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

import isNonEmptyString from "./isNonEmptyString";
import { createNode } from "./dom";

const IMAGE_TAG = "img";

/**
 * Fires an image pixel from the current document's window.
 * @param {object} currentDocument
 * @param {object} attributes - must include src
 * @returns {undefined}
 */
export default ({ currentDocument = document, attributes = {} }) => {
  if (isNonEmptyString(attributes.src)) {
    createNode(IMAGE_TAG, attributes, [], currentDocument);
  }
};
