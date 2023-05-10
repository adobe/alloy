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
import injectWindow from "../../../../../src/components/DecisioningEngine/injectWindow";

describe("DecisioningEngine::injectWindow", () => {
  const window = {
    document: {
      referrer: "https://myreferrer.com"
    },
    location: {
      href: "https://mylocation.com"
    },
    innerWidth: 100,
    innerHeight: 100,
    scrollX: 10,
    scrollY: 10
  };
  it("should return window information", () => {
    const windowInfo = injectWindow(window);
    expect(windowInfo.url).toEqual("https://mylocation.com");
    expect(windowInfo.referrer).toEqual("https://myreferrer.com");
    expect(windowInfo.width).toEqual(100);
    expect(windowInfo.height).toEqual(100);
    expect(windowInfo.scrollX).toEqual(10);
    expect(windowInfo.scrollY).toEqual(10);
  });
});
