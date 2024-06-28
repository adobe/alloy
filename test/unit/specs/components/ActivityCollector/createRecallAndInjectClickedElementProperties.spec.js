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

import createRecallAndInjectClickedElementProperties from "../../../../../src/components/ActivityCollector/createRecallAndInjectClickedElementProperties.js";

describe("ActivityCollector::createRecallAndInjectClickedElementProperties", () => {
  let props;
  let clickActivityStorage;
  let event;

  beforeEach(() => {
    props = {};
    clickActivityStorage = {
      load: jasmine.createSpy().and.returnValue(props),
      save: jasmine.createSpy(),
    };
    event = {
      mergeXdm: jasmine.createSpy(),
      mergeData: jasmine.createSpy(),
    };
  });

  it("should return a function", () => {
    const recallAndInjectClickedElementProperties =
      createRecallAndInjectClickedElementProperties({ clickActivityStorage });
    expect(recallAndInjectClickedElementProperties).toEqual(
      jasmine.any(Function),
    );
  });

  it("should merge stored clicked element properties to event XDM and DATA", () => {
    const recallClickElementProperties =
      createRecallAndInjectClickedElementProperties({ clickActivityStorage });
    props.pageName = "examplePage";
    props.linkName = "example";
    props.linkRegion = "exampleRegion";
    props.linkType = "external";
    props.linkUrl = "https://example.com";
    props.pageIDType = 1;
    recallClickElementProperties(event);
    expect(event.mergeXdm).toHaveBeenCalledWith({
      web: {
        webInteraction: {
          name: "example",
          region: "exampleRegion",
          type: "external",
          URL: "https://example.com",
          linkClicks: {
            value: 1,
          },
        },
      },
    });
    expect(event.mergeData).toHaveBeenCalledWith({
      __adobe: {
        analytics: {
          c: {
            a: {
              activitymap: {
                page: "examplePage",
                link: "example",
                region: "exampleRegion",
                pageIDType: 1,
              },
            },
          },
        },
      },
    });
    expect(clickActivityStorage.save).toHaveBeenCalledWith({
      pageName: "examplePage",
      pageIDType: 1,
    });
  });
});
