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
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::prependHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  it("should prepend personalized content", () => {
    const modules = initDomActionsModules();
    const { prependHtml } = modules;
    const content = `<li>3</li>`;
    const element = createNode(
      "ul",
      { id: "prependHtml" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#prependHtml",
      prehidingSelector: "#prependHtml",
      content: `<li>1</li><li>2</li>`,
      meta
    };

    return prependHtml(settings).then(() => {
      const result = selectNodes("ul#prependHtml li");

      expect(result.length).toEqual(3);
      expect(result[0].innerHTML).toEqual("1");
      expect(result[1].innerHTML).toEqual("2");
      expect(result[2].innerHTML).toEqual("3");
    });
  });
});
