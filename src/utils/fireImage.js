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

import document from "./document";
import createNode from "./dom/createNode";
import { IMG } from "../constants/tagName";

/**
 * Fires an image pixel from the current document's window.
 * @param {object} currentDocument
 * @param {string} src
 * @returns {Promise}
 */
export default ({ src, currentDocument = document }) => {
  return new Promise((resolve, reject) => {
    const attrs = { src };
    const props = {
      onload: resolve,
      onerror: reject,
      onabort: reject
    };

    createNode(IMG, attrs, props, [], currentDocument);
  });
};
