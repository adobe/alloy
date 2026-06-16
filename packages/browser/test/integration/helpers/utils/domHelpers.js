/*
Copyright 2026 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const trackedElements = [];

/**
 * Creates an anchor element, appends it to document.body, and registers it
 * for cleanup via cleanupDom().
 */
export const appendLink = ({ id, href, text }) => {
  const link = document.createElement("a");
  link.id = id;
  link.href = href;
  link.textContent = text;
  document.body.appendChild(link);
  trackedElements.push(link);
  return link;
};

/**
 * Simulates a non-navigating click on a link element.
 */
export const clickLink = (link) => {
  link.addEventListener("click", (e) => e.preventDefault());
  link.click();
};

/**
 * Removes all elements appended via appendLink from the DOM.
 * Call in afterEach to prevent inter-test accumulation.
 */
export const cleanupDom = () => {
  trackedElements.forEach((el) => el.remove());
  trackedElements.length = 0;
};
