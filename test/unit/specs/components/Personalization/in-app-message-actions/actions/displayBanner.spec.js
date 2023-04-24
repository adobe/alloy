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
import displayBanner from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayBanner";
import { createNode } from "../../../../../../../src/utils/dom";
import { DIV } from "../../../../../../../src/constants/tagName";

describe("Personalization::IAM:banner", () => {
  it("inserts banner into dom", async () => {
    const something = createNode(
      DIV,
      { className: "something" },
      {
        innerHTML:
          "<p>Amet cillum consectetur elit cupidatat voluptate nisi duis et occaecat enim pariatur.</p>"
      }
    );

    document.body.prepend(something);

    await displayBanner({
      type: "banner",
      position: "top",
      closeButton: false,
      background: "#00a0fe",
      content:
        "<span style='color: white;'>FLASH SALE!! 50% off everything, 24 hours only!</span>"
    });

    const banner = document.querySelector("div#alloy-messaging-banner");
    const bannerStyle = document.querySelector(
      "style#alloy-messaging-banner-styles"
    );

    expect(banner).not.toBeNull();
    expect(bannerStyle).not.toBeNull();

    expect(banner.parentNode).toEqual(document.body);
    expect(bannerStyle.parentNode).toEqual(document.head);

    expect(banner.previousElementSibling).toBeNull();
    expect(banner.nextElementSibling).toEqual(something);
  });
});
