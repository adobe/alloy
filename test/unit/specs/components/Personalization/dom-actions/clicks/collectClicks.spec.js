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

import {
  createNode,
  appendNode,
  selectNodes,
  removeNode
} from "../../../../../../../src/utils/dom";
import collectClicks from "../../../../../../../src/components/Personalization/dom-actions/clicks/collectClicks";

describe("Personalization::tracking::clicks", () => {
  afterEach(() => {
    selectNodes(".eq").forEach(removeNode);
  });

  it("should collect clicks", () => {
    const meta = [
      {
        id: "AT:1234",
        scope: "example_scope"
      }
    ];
    const getClickMetas = jasmine
      .createSpy("getClickMetas")
      .and.returnValue(meta);
    const content = `
      <div class="b">
        <div id="one" class="c">first</div>

        <div id="two" class="c">second</div>

        <div id="three" class="c">third</div>
      </div>
    `;
    const node = createNode(
      "DIV",
      { id: "abc", class: "eq" },
      { innerHTML: content }
    );

    appendNode(document.body, node);

    const selectors = ["#abc:eq(0) > div.b:eq(0) > div.c"];

    const element = document.getElementById("one");
    const { decisionsMeta, propositionActionLabel } = collectClicks(
      element,
      selectors,
      getClickMetas
    );

    expect(decisionsMeta).toEqual(meta);
    expect(propositionActionLabel).toEqual("");
  });

  it("should collect and dedupe clicks with labels", () => {
    const metaOuter = [
      {
        id: "AT:outer-id-1",
        scope: "outer-scope1"
      },
      {
        id: "AJO:inner-id-2",
        scope: "inner-scope2",
        trackingLabel: "outer-label-2"
      },
      {
        id: "AJO:outer-id-3",
        scope: "outer-scope3",
        trackingLabel: "outer-label-3"
      }
    ];
    const metaInner = [
      {
        id: "AT:inner-id-1",
        scope: "inner-scope1"
      },
      {
        id: "AJO:inner-id-2",
        scope: "inner-scope2",
        trackingLabel: "inner-label-2"
      },
      {
        id: "AJO:inner-id-3",
        scope: "inner-scope3",
        trackingLabel: "inner-label-3"
      }
    ];
    const getClickMetas = jasmine
      .createSpy("getClickMetas")
      .withArgs("#abc:eq(0) > div.b:eq(0)")
      .and.returnValue(metaOuter)
      .withArgs("#abc:eq(0) > div.b:eq(0) > div.c")
      .and.returnValue(metaInner);
    const content = `
      <div class="b">
        <div id="one" class="c">first</div>

        <div id="two" class="c">second</div>

        <div id="three" class="c">third</div>
      </div>
    `;
    const node = createNode(
      "DIV",
      { id: "abc", class: "eq" },
      { innerHTML: content }
    );

    appendNode(document.body, node);

    const selectors = [
      "#abc:eq(0) > div.b:eq(0)",
      "#abc:eq(0) > div.b:eq(0) > div.c"
    ];

    const element = document.getElementById("one");
    const { decisionsMeta, propositionActionLabel } = collectClicks(
      element,
      selectors,
      getClickMetas
    );

    expect(decisionsMeta).toEqual([
      {
        id: "AT:outer-id-1",
        scope: "outer-scope1"
      },
      {
        id: "AJO:inner-id-2",
        scope: "inner-scope2"
      },
      {
        id: "AJO:outer-id-3",
        scope: "outer-scope3"
      },
      {
        id: "AT:inner-id-1",
        scope: "inner-scope1"
      },
      {
        id: "AJO:inner-id-3",
        scope: "inner-scope3"
      }
    ]);
    expect(propositionActionLabel).toEqual("inner-label-2");
  });
});
