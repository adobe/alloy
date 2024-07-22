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

import createStorePageViewProperties from "../../../../../src/components/ActivityCollector/createStorePageViewProperties.js";

describe("ActivityCollector::createStorePageViewProperties", () => {
  let clickActivityStorage;
  beforeEach(() => {
    clickActivityStorage = {
      save: jasmine.createSpy(),
    };
  });

  it("should return a function", () => {
    const storePageViewProperties = createStorePageViewProperties({
      clickActivityStorage,
    });
    expect(storePageViewProperties).toEqual(jasmine.any(Function));
  });

  it("stores page view properties when available in event", () => {
    const storePageViewProperties = createStorePageViewProperties({
      clickActivityStorage,
    });
    storePageViewProperties({
      getContent: () => ({
        xdm: {
          web: {
            webPageDetails: {
              name: "testPageName",
            },
          },
        },
      }),
    });
    expect(clickActivityStorage.save).toHaveBeenCalledWith({
      pageName: "testPageName",
      pageIDType: 1,
    });
  });
});
