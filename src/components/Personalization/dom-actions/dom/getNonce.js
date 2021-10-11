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

import document from "../../../../utils/document";

let nonce;

/**
 * Returns the nonce if available.
 * @param {Node} [context=document] defaults to document
 * @returns {(String|undefined)} the nonce or undefined if not available
 */
export default (context = document) => {
  if (nonce === undefined) {
    const n = context.querySelector("[nonce]");
    // NOTE: We're keeping n.getAttribute("nonce") until it is safe to remove:
    //   ref: https://github.com/whatwg/html/issues/2369#issuecomment-280853946
    nonce = n && (n.nonce || n.getAttribute("nonce"));
  }
  return nonce;
};

// This function is only used for testing and removed when library is built (tree-shaking)
export const testResetCachedNonce = () => {
  nonce = undefined;
};
