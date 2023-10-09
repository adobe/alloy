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
import inAppMessageConsequenceAdapter from "../../../../../../src/components/DecisioningEngine/consequenceAdapters/inAppMessageConsequenceAdapter";
import { TEXT_HTML } from "../../../../../../src/components/Personalization/constants/contentType";

describe("DecisioningEngine:inAppMessageConsequenceAdapter", () => {
  it("handles cjmiam", () => {
    expect(
      inAppMessageConsequenceAdapter(
        "72042c7c-4e34-44f6-af95-1072ae117424",
        "cjmiam",
        {
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
          html: "<!doctype html></html>"
        }
      )
    ).toEqual({
      schema: "https://ns.adobe.com/personalization/message/in-app",
      data: {
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
        webParameters: jasmine.any(Object),
        content: "<!doctype html></html>",
        contentType: TEXT_HTML
      },
      id: "72042c7c-4e34-44f6-af95-1072ae117424"
    });
  });
});
