/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

/*
 * Preprocess customCode actions before rendering, so that offer selectors are remapped appropriately for
 * target offers, to align with the way it works in at.js.
 */

const ACTION_CUSTOM_CODE = "customCode";
const TARGET_BODY_SELECTOR = "BODY > *:eq(0)";

export default action => {
  const { selector, type } = action;

  if (type !== ACTION_CUSTOM_CODE) {
    return action;
  }

  if (selector !== TARGET_BODY_SELECTOR) {
    return action;
  }

  return { ...action, selector: "BODY" };
};
