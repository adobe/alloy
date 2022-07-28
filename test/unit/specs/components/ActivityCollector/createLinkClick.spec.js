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

import createLinkClick from "../../../../../src/components/ActivityCollector/createLinkClick";
import createEvent from "../../../../../src/core/createEvent";
import configValidators from "../../../../../src/components/ActivityCollector/configValidators";

describe("ActivityCollector::createLinkClick", () => {
  const getLinkDetails = jasmine.createSpy("getLinkDetails");

  it("Extends event XDM data with link information for supported anchor elements when clickCollectionEnabled", () => {
    const config = {
      downloadLinkQualifier:
        configValidators.downloadLinkQualifier.defaultValue,
      clickCollectionEnabled: true
    };
    const linkClick = createLinkClick({ getLinkDetails, config });

    const event = createEvent();
    getLinkDetails.and.returnValue({
      xdm: {
        web: {
          webInteraction: {
            name: "test1"
          }
        }
      },
      data: {}
    });
    linkClick({ targetElement: {}, event });
    expect(event.isEmpty()).toBe(false);
  });
  it("does not extend event XDM data when clickCollectionEnabled is false", () => {
    const event = createEvent();
    const config = {
      downloadLinkQualifier:
        configValidators.downloadLinkQualifier.defaultValue,
      clickCollectionEnabled: false
    };

    const linkClick = createLinkClick({ getLinkDetails, config });

    getLinkDetails.and.returnValue({
      xdm: {
        web: {
          webInteraction: {
            name: "test1"
          }
        }
      },
      data: {}
    });
    linkClick({ targetElement: {}, event });
    expect(event.isEmpty()).toBe(true);
  });
  it("Does not extend event XDM data with link information for unsupported anchor elements", () => {
    const event = createEvent();
    const config = {
      downloadLinkQualifier:
        configValidators.downloadLinkQualifier.defaultValue,
      clickCollectionEnabled: true
    };

    const linkClick = createLinkClick({ getLinkDetails, config });

    getLinkDetails.and.returnValue(undefined);
    linkClick({ targetElement: {}, event });
    expect(event.isEmpty()).toBe(true);
  });
});
