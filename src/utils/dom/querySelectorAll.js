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

import toArray from "../toArray";

const SIBLING_PATTERN = /^\s*>/;

export default (context, selector) => {
  if (!SIBLING_PATTERN.test(selector)) {
    return toArray(context.querySelectorAll(selector));
  }

  const tag = `alloy-${Date.now()}`;

  // We could use a :scope selector here, but we want to be IE compliant
  // so we add a dummy css class to be able to select the children
  try {
    context.classList.add(tag);

    return toArray(context.querySelectorAll(`.${tag} ${selector}`));
  } finally {
    context.classList.remove(tag);
  }
};
