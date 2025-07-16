/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default (window, element) => {
  const base = window.location.href;
  let href = element.href || "";
  // Some objects (like SVG animations) can contain a href object instead of a string
  if (typeof href !== "string") {
    href = "";
  }
  try {
    return new URL(href, base).href;
  } catch {
    return href;
  }
};
