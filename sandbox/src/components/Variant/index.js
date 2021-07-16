/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

export const Variant = props => {
  const queryParams = new URLSearchParams(props.query);
  const keys = queryParams.keys();

  // Get all elements that can be toggled by this Variant
  const elements = [];
  for (const key of Object.keys(props)) {
    if (key.startsWith("element")) {
      elements.push(props[key]);
    }
  }

  // Show all elements if the query matches a property on the Variant
  let show = false;
  for (const key of keys) {
    if (props[key] === queryParams.get(key)) {
      show = true;
      break;
    }
  }

  if (show) {
    return elements;
  }

  return null;
};
