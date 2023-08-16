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
  buildStyleFromParameters,
  createOverlayElement
} from "../../../../../../../src/components/Personalization/in-app-message-actions/actions/displayIframeContent";

describe("DOM Actions", () => {
  describe("buildStyleFromParameters", () => {
    it("should build the style object correctly", () => {
      const mobileParameters = {
        verticalAlign: "center",
        width: 80,
        horizontalAlign: "left",
        backdropColor: "rgba(0, 0, 0, 0.7)",
        height: 60,
        cornerRadius: 10,
        horizontalInset: 5,
        verticalInset: 10,
        uiTakeover: true
      };

      const webParameters = {};

      const style = buildStyleFromParameters(mobileParameters, webParameters);

      expect(style.width).toBe("80%");
      expect(style.backgroundColor).toBe("rgba(0, 0, 0, 0.7)");
      expect(style.borderRadius).toBe("10px");
      expect(style.border).toBe("none");
      expect(style.zIndex).toBe("9999");
      expect(style.position).toBe("fixed");
      expect(style.overflow).toBe("hidden");
      expect(style.left).toBe("5%");
      expect(style.height).toBe("60vh");
    });
  });

  describe("createOverlayElement", () => {
    it("should create overlay element with correct styles", () => {
      const parameter = {
        backdropOpacity: 0.8,
        backdropColor: "#000000"
      };

      const overlayElement = createOverlayElement(parameter);

      expect(overlayElement.id).toBe("overlay-container");
      expect(overlayElement.style.position).toBe("fixed");
      expect(overlayElement.style.top).toBe("0px");
      expect(overlayElement.style.left).toBe("0px");
      expect(overlayElement.style.width).toBe("100%");
      expect(overlayElement.style.height).toBe("100%");
      expect(overlayElement.style.zIndex).toBe("1");
      expect(overlayElement.style.background).toBe("rgb(0, 0, 0)");
      expect(overlayElement.style.opacity).toBe("0.8");
      expect(overlayElement.style.backgroundColor).toBe("rgb(0, 0, 0)");
    });
  });
});
