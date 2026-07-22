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
 * Appends arbitrary HTML to document.body and registers the inserted top-level
 * elements for cleanup. Mirrors the functional suite's addHtmlToBody so anchor
 * structures (spans, download/data-* attributes, custom-region wrappers) can be
 * built verbatim from the original tests. Returns the inserted elements.
 */
export const appendHtmlToBody = (html) => {
  const container = document.createElement("div");
  container.innerHTML = html.trim();
  const elements = [...container.children];
  elements.forEach((el) => {
    document.body.appendChild(el);
    trackedElements.push(el);
  });
  return elements;
};

/**
 * Simulates a click on a link element. By default the click's default action is
 * prevented so the test page does not navigate away; pass
 * { preventNavigation: false } to let real hash navigation proceed.
 */
export const clickLink = (link, { preventNavigation = true } = {}) => {
  if (preventNavigation) {
    link.addEventListener("click", (e) => e.preventDefault());
  }
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
