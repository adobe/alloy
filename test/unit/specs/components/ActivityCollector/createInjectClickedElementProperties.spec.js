/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createInjectClickedElementProperties from "../../../../../src/components/ActivityCollector/createInjectClickedElementProperties.js";
import createEvent from "../../../../../src/core/createEvent.js";
import { downloadLinkQualifier as dlwValidator } from "../../../../../src/components/ActivityCollector/configValidators.js";

describe("ActivityCollector::createInjectClickedElementProperties", () => {
  const getClickedElementProperties = jasmine.createSpy(
    "getClickedElementProperties",
  );
  const clickActivityStorage = jasmine.createSpyObj("clickActivityStorage", [
    "save",
  ]);
  const downloadLinkQualifier = dlwValidator();

  it("Extends event XDM data with link information for supported anchor elements when clickCollectionEnabled", () => {
    const config = {
      downloadLinkQualifier,
      clickCollectionEnabled: true,
      clickCollection: {},
    };
    const injectClickedElementProperties = createInjectClickedElementProperties(
      { getClickedElementProperties, clickActivityStorage, config },
    );
    const event = createEvent();
    getClickedElementProperties.and.returnValue({
      xdm: {
        web: {
          webInteraction: {
            name: "test1",
          },
        },
      },
      data: {},
      isValidLink: () => true,
      isInternalLink: () => false,
      isValidActivityMapData: () => true,
    });
    injectClickedElementProperties({ event, clickedElement: {} });
    expect(event.isEmpty()).toBe(false);
  });

  it("Does not extend event XDM data when clickCollectionEnabled is false", () => {
    const event = createEvent();
    const config = {
      downloadLinkQualifier,
      clickCollectionEnabled: false,
    };
    const injectClickedElementProperties = createInjectClickedElementProperties(
      {
        getClickedElementProperties,
        config,
      },
    );
    getClickedElementProperties.and.returnValue({
      xdm: {
        web: {
          webInteraction: {
            name: "test1",
          },
        },
      },
      data: {},
    });
    injectClickedElementProperties({ clickedElement: {}, event });
    expect(event.isEmpty()).toBe(true);
  });

  it("Does not extend event XDM data with link information for unsupported anchor elements", () => {
    const event = createEvent();
    const config = {
      downloadLinkQualifier,
      clickCollectionEnabled: true,
      clickCollection: {},
    };
    const injectClickedElementProperties = createInjectClickedElementProperties(
      {
        getClickedElementProperties,
        clickActivityStorage,
        config,
      },
    );
    getClickedElementProperties.and.returnValue({
      data: {},
      isValidLink: () => false,
      isInternalLink: () => false,
      isValidActivityMapData: () => true,
    });
    injectClickedElementProperties({ clickedElement: {}, event });
    expect(event.isEmpty()).toBe(true);
  });

  it("Does not save click data to storage if onBeforeLinkClickSend is defined", () => {
    const config = {
      clickCollectionEnabled: true,
      clickCollection: {
        internalLinkEnabled: true,
        eventGroupingEnabled: true,
      },
      onBeforeLinkClickSend: () => {},
    };
    const logger = jasmine.createSpyObj("logger", ["info"]);
    getClickedElementProperties.and.returnValue({
      isValidLink: () => true,
      isInternalLink: () => true,
      pageName: "testPage",
      pageIDType: 1,
      linkName: "testLink",
      linkType: "other",
    });
    const injectClickedElementProperties = createInjectClickedElementProperties(
      {
        config,
        logger,
        getClickedElementProperties,
        clickActivityStorage,
      },
    );
    const event = jasmine.createSpyObj("event", ["mergeXdm", "mergeData"]);
    injectClickedElementProperties({ clickedElement: {}, event });
    // No click data should be saved to storage, only the page data.
    expect(clickActivityStorage.save).toHaveBeenCalledWith({
      pageName: "testPage",
      pageIDType: 1,
    });
    // If mergeXdm and mergeData are called, it means that the click data was not saved and
    // will instead go out with the event.
    expect(event.mergeXdm).toHaveBeenCalled();
    expect(event.mergeData).toHaveBeenCalled();
  });
});
