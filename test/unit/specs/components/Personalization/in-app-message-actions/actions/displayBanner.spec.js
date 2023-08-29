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
        uiTakeover: false,
        horizontalAlign: "center",
        width: 80,
        displayAnimation: "top",
        backdropColor: "#000000",
        height: 60
      },
      content: `<!doctype html><html lang=""><head></head><body><div>banner</div>Alf Says</body></html>`,
      contentType: "text/html"
    });

    const overlayContainer = document.querySelector(
      "div#alloy-overlay-container"
    );
    const messagingContainer = document.querySelector(
      "div#alloy-messaging-container"
    );

    expect(overlayContainer).toBeNull();
    expect(messagingContainer).not.toBeNull();

    expect(messagingContainer.parentNode).toEqual(document.body);
    expect(messagingContainer.nextElementSibling).toBeNull();

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
