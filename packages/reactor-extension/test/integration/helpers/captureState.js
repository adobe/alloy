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

// Captures everything Launch can observe from a view, using only the extension
// bridge and the DOM, so snapshots stay valid across form library changes.

const settle = () =>
  new Promise((resolve) => {
    let frames = 0;
    const next = () =>
      frames++ === 8 ? setTimeout(resolve) : requestAnimationFrame(next);
    requestAnimationFrame(next);
  });

const call = async (fn) => {
  try {
    return await fn();
  } catch (e) {
    return { threw: e.message };
  }
};

const textOf = (id) => document.getElementById(id)?.textContent?.trim();

const labelOf = (element) =>
  element.getAttribute("aria-label") ||
  (element.getAttribute("aria-labelledby") ?? "")
    .split(/\s+/)
    .map(textOf)
    .filter(Boolean)
    .join(" ") ||
  [...(element.labels ?? [])]
    .map((label) => label.textContent.trim())
    .join(" ") ||
  element.getAttribute("name") ||
  element.tagName;

const visibleErrors = () =>
  [...document.querySelectorAll('[aria-invalid="true"]')]
    .filter((element) => element.getBoundingClientRect().width > 0)
    .map((element) => ({
      field: labelOf(element),
      testId:
        element.closest("[data-test-id]")?.getAttribute("data-test-id") ?? null,
      messages: (element.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .map(textOf)
        .filter(Boolean),
    }));

const schemaTreeErrors = () =>
  [...document.querySelectorAll('[data-test-id="xdmTreeNodeTitle"]')].flatMap(
    (node) =>
      [...node.querySelectorAll("[title]")].map((error) => ({
        field: node.querySelector(
          '[data-test-id="xdmTreeNodeTitleDisplayName"]',
        )?.textContent,
        message: error.getAttribute("title"),
      })),
  );

// JSON.stringify would hide undefined values and NaN, which differ between
// settings that otherwise look the same.
const serialize = (value) =>
  JSON.stringify(value, (_, v) => {
    if (v === undefined) return "<undefined>";
    if (Number.isNaN(v)) return "<NaN>";
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.fromEntries(Object.entries(v).sort());
    }
    return v;
  });

export default async function captureState(bridge) {
  const registration = await bridge.registration;
  await settle();
  const settingsBeforeValidate = await call(() => registration.getSettings());
  const valid = await call(() => registration.validate());
  const settingsAfterValidate = await call(() => registration.getSettings());
  await settle();
  const treeErrors = schemaTreeErrors();
  return {
    settingsBeforeValidate,
    valid,
    settingsAfterValidate:
      serialize(settingsAfterValidate) === serialize(settingsBeforeValidate)
        ? "<same as before validation>"
        : settingsAfterValidate,
    errors: visibleErrors(),
    ...(treeErrors.length > 0 && { schemaTreeErrors: treeErrors }),
  };
}
