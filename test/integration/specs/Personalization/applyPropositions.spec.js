/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import alloyConfig from "../../helpers/alloy/config.js";
import {
  describe,
  test,
  expect,
  beforeEach,
} from "../../helpers/testsSetup/extend.js";

describe("applyPropositions", () => {
  let testElement;
  const testElementClass = "heroimage";
  const testElementTag = "div";
  const testElementSelector = `${testElementTag}.${testElementClass}`;
  beforeEach(() => {
    testElement = document.createElement(testElementTag);
    testElement.className = testElementClass;
    testElement.innerHTML = "Original content";
    document.body.appendChild(testElement);
    return () => {
      document.body.removeChild(testElement);
    };
  });

  // TGT-52945 and PLATIR-51065
  test("html-content-item and metadata should work", async ({ alloy }) => {
    alloy("configure", {
      ...alloyConfig,
      debugEnabled: true,
    });

    const propositions = [
      {
        id: "AT:eyJhY3Rpdml0eUlkIjoiMTY1NjkxNCIsImV4cGVyaWVuY2VJZCI6IjAifQ==",
        scope: "web://example.com",
        scopeDetails: {
          decisionProvider: "TGT",
          activity: {
            id: "1656914",
          },
          experience: {
            id: "0",
          },
        },
        items: [
          {
            id: "910278",
            schema: "https://ns.adobe.com/personalization/html-content-item",
            data: {
              id: "910278",
              format: "text/html",
              content:
                '<img style="display: block; user-select: none; margin: auto; background-color: rgb(230, 230, 230); transition: background-color 300ms; --darkreader-inline-bgcolor: #26292b;" src="https://http.cat/200.jpg" data-darkreader-inline-bgcolor="" width="750" height="600">',
              selector: "div.heroimage",
              type: "setHtml",
            },
            meta: {
              "experience.id": "0",
              "activity.name": "App TC: Form Based Composer Activity",
              "activity.id": "1656914",
              "experience.name": "Experience A",
              "geo.zip": "23224",
              "option.id": "2",
              "geo.ispName": "comcast cable communications inc.",
              "profile.productPurchasedId": "",
              "offer.name":
                "/app_tc_form_basedcomposeractivity/experiences/0/pages/0/zones/0/1729542513711",
              "profile.clientHasPurchasedMTP": "false",
              "offer.id": "910278",
            },
          },
        ],
      },
    ];

    const metadata = {
      "web://example.com": {
        selector: testElementSelector,
        actionType: "setHtml",
      },
    };

    const result = await alloy("applyPropositions", {
      propositions,
      metadata,
    });
    expect(result).toBeDefined();
    expect(result).toHaveProperty("propositions");
    expect(result).toHaveProperty("propositions.length", 1);
    expect(result).toHaveProperty("propositions[0].renderAttempted", true);
    expect(testElement.innerHTML).toContain("http.cat/200.jpg");
  });
});
