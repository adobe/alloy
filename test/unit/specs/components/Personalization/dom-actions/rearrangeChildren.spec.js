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
import {
  selectNodes,
  appendNode,
  createNode,
} from "../../../../../../src/utils/dom/index.js";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions/index.js";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges.js";

describe("Personalization::actions::rearrange", () => {
  beforeEach(() => {
    cleanUpDomChanges("rearrange");
  });

  afterEach(() => {
    cleanUpDomChanges("rearrange");
  });

  it("should rearrange elements when from < to", () => {
    const modules = initDomActionsModules();
    const { rearrange } = modules;
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content },
    );

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#rearrange",
      prehidingSelector: "#rearrange",
      content: { from: 0, to: 2 },
      meta,
    };

    return rearrange(settings).then(() => {
      const result = selectNodes("li");

      expect(result[0].textContent).toEqual("2");
      expect(result[1].textContent).toEqual("3");
      expect(result[2].textContent).toEqual("1");
    });
  });

  it("should rearrange elements when from > to", () => {
    const modules = initDomActionsModules();
    const { rearrange } = modules;
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content },
    );

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#rearrange",
      prehidingSelector: "#rearrange",
      content: { from: 2, to: 0 },
      meta,
    };

    return rearrange(settings).then(() => {
      const result = selectNodes("li");

      expect(result[0].textContent).toEqual("3");
      expect(result[1].textContent).toEqual("1");
      expect(result[2].textContent).toEqual("2");
    });
  });
});
