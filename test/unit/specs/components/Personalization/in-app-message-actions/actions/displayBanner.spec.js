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
import { createNode } from "../../../../../../../src/utils/dom";
import { DIV } from "../../../../../../../src/constants/tagName";
import displayBanner from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayBanner";

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

    document.body.append(something);

    await displayBanner({
      mobileParameters: {
        verticalAlign: "center",
        dismissAnimation: "top",
        verticalInset: 0,
        backdropOpacity: 0.2,
        cornerRadius: 15,
        horizontalInset: 0,
        uiTakeover: true,
        horizontalAlign: "center",
        width: 80,
        displayAnimation: "top",
        backdropColor: "#000000",
        height: 60
      },
      content: `<!doctype html><html lang=""><head></head><body><div>banner</div>Alf Says</body></html>`,
      contentType: "text/html"
    });

    const container = document.querySelector("div#alloy-messaging-container");

    expect(container).not.toBeNull();

    expect(container.parentNode).toEqual(document.body);

    expect(container.previousElementSibling).toEqual(something);
    expect(container.nextElementSibling).toBeNull();

    const iframe = document.querySelector(
      ".alloy-messaging-container > iframe"
    );

    expect(iframe).not.toBeNull();

    await new Promise(resolve => {
      iframe.addEventListener("load", () => {
        resolve();
      });
    });

    expect(
      (iframe.contentDocument || iframe.contentWindow.document).body.outerHTML
    ).toContain("Alf Says");
  });
});
