/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { appendNode, createNode } from "../../../../../../src/utils/dom/index.js";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions/index.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
    delete window.someEvar123;
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
    cleanUpDomChanges("btn");
    delete window.someEvar123;
  });

  it("should set personalized content", async () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: "bar",
      meta
    };

    await setHtml(settings);
    expect(element.innerHTML).toEqual("bar");
  });

  it("should execute inline JavaScript", async () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content:
        "<script id='evar123'>setTimeout(function onTimeout() { window.someEvar123 = 1; }, 500);</script>",
      meta
    };

    await setHtml(settings);
    await sleep(501);

    expect(window.someEvar123).toEqual(1);

    const scriptElements = document.querySelectorAll("#evar123");
    expect(scriptElements.length).toEqual(1);
  });

  it("should execute inline JavaScript with event listeners", async () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const button = createNode("button", { id: "btn" });
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";

    appendNode(document.body, button);
    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: `<script>
          var btn = document.getElementById('btn');
          btn.addEventListener('click', function onEvent() { window.someEvar123 = 2; });
        </script>`,
      meta
    };

    await setHtml(settings);

    button.click();
    expect(window.someEvar123).toEqual(2);
  });
});
