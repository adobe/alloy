/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import remapCustomCodeOffers from "../../../../../../src/components/Personalization/dom-actions/remapCustomCodeOffers.js";

describe("remapCustomCodeOffers", () => {
  it("changes target selector to parent for standard body selector", () => {
    expect(
      remapCustomCodeOffers({
        type: "customCode",
        content: "<div>superfluous</div>",
        selector: "BODY > *:eq(0)"
      })
    ).toEqual({
      type: "customCode",
      content: "<div>superfluous</div>",
      selector: "BODY"
    });
  });

  it("does not change selector if non-standard", () => {
    expect(
      remapCustomCodeOffers({
        type: "customCode",
        content: "<div>superfluous</div>",
        selector: ".whoopie"
      })
    ).toEqual({
      type: "customCode",
      content: "<div>superfluous</div>",
      selector: ".whoopie"
    });
  });

  it("only handles customCode type", () => {
    expect(
      remapCustomCodeOffers({
        type: "somethingSpecial",
        content: "<div>superfluous</div>",
        selector: "BODY > *:eq(0)"
      })
    ).toEqual({
      type: "somethingSpecial",
      content: "<div>superfluous</div>",
      selector: "BODY > *:eq(0)"
    });
  });
});
