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

import { t } from "testcafe";
import createExtensionViewFixture from "../../helpers/createExtensionViewFixture.mjs";

createExtensionViewFixture({
  title: "Data collection layout",
  viewPath: "configuration/configuration.html",
});

test("keeps callback buttons and beta badges inside their visual bounds", async () => {
  const initInfo = {
    settings: null,
    extensionSettings: {},
    company: { orgId: "layout-test" },
    tokens: {},
  };

  await t.eval(
    () => {
      window.initializeExtensionViewPromise = window.initializeExtensionView({
        initInfo,
      });
      return window.initializeExtensionViewPromise;
    },
    { dependencies: { initInfo } },
  );

  const geometry = await t.eval(() => {
    const callbackFields = [
      "onBeforeEventSendEditButton",
      "filterClickDetailsEditButton",
    ].map((testId) => {
      const button = document
        .querySelector(`[data-test-id="${testId}"]`)
        .closest(".CodePreview-openEditorButton");
      const textarea = button.parentElement.querySelector("textarea");
      const buttonBounds = button.getBoundingClientRect();
      const textareaBounds = textarea.getBoundingClientRect();
      const buttonLabel = button.querySelector("button span");

      return {
        buttonTop: buttonBounds.top,
        buttonBottom: buttonBounds.bottom,
        buttonLabelClipped: buttonLabel.scrollWidth > buttonLabel.clientWidth,
        textareaTop: textareaBounds.top,
        textareaBottom: textareaBounds.bottom,
        textareaHeight: textareaBounds.height,
      };
    });

    const badges = [
      "eventGroupingSessionStorageField",
      "eventGroupingMemoryField",
    ].map((testId) => {
      const option = document.querySelector(`[data-test-id="${testId}"]`);
      const betaElements = Array.from(option.querySelectorAll("*")).filter(
        (element) => element.textContent.trim() === "Beta",
      );
      const badge = betaElements.sort(
        (left, right) =>
          right.getBoundingClientRect().width -
          left.getBoundingClientRect().width,
      )[0];
      const label = betaElements[betaElements.length - 1];

      return {
        width: badge.getBoundingClientRect().width,
        textClipped: label.scrollWidth > label.clientWidth,
      };
    });

    return { callbackFields, badges };
  });

  await t.expect(geometry.callbackFields.length).eql(2);
  await t.expect(geometry.badges.length).eql(2);
  await t
    .expect(
      geometry.callbackFields.every(
        ({
          buttonTop,
          buttonBottom,
          buttonLabelClipped,
          textareaTop,
          textareaBottom,
          textareaHeight,
        }) =>
          textareaHeight >= 100 &&
          buttonTop >= textareaTop &&
          buttonBottom <= textareaBottom &&
          !buttonLabelClipped,
      ),
    )
    .ok("Callback buttons and labels must fit inside tall text areas");
  await t
    .expect(
      geometry.badges.every(
        ({ width, textClipped }) => width <= 60 && !textClipped,
      ),
    )
    .ok("Beta badges must be content-sized without clipping their labels");
});
