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

import createClickActivityStorage from "../../../../../src/components/ActivityCollector/createClickActivityStorage";

describe("ActivityCollector::createClickActivityStorage", () => {
  let config;
  let window;

  beforeEach(() => {
    window = {};
    config = {
      orgId: "ABC@AdobeOrg",
      clickCollection: {
        sessionStorageEnabled: false
      }
    };
  });

  it("enables for transient storage when created", () => {
    createClickActivityStorage({ config, window });
    expect(window["com.adobe.alloy.ABC@AdobeOrg"]).toBeDefined();
  });

  it("saves data to storage", () => {
    const storage = createClickActivityStorage({ config, window });
    storage.save({ some: "data" });
    expect(storage.load()).toEqual({ some: "data" });
  });

  it("removes data from storage", () => {
    const storage = createClickActivityStorage({ config, window });
    storage.save({ some: "data" });
    storage.remove();
    expect(storage.load()).toBeNull();
  });
});
