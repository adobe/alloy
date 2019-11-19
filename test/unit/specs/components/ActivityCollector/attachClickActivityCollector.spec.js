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

import attachClickActivityCollector from "../../../../../src/components/ActivityCollector/attachClickActivityCollector";

describe("ActivityCollector::attachClickActivityCollector", () => {
  const cfg = {
    clickCollectionEnabled: true
  };
  const mockEventManager = {
    createEvent: () => {
      return {
        isEmpty: () => true
      };
    }
  };
  const mockLifeCycle = {
    onClick: () => {
      return Promise.resolve();
    }
  };
  let clickHandler;
  beforeEach(() => {
    // eslint-disable-next-line no-unused-vars
    spyOn(document, "addEventListener").and.callFake((name, handler, type) => {
      clickHandler = handler;
    });
  });

  fit("Attaches click handler if clickCollectionEnabled is set to true", () => {
    attachClickActivityCollector(cfg, mockEventManager, mockLifeCycle);
    expect(document.addEventListener).toHaveBeenCalled();
  });
  fit("Does not attach click handler if clickCollectionEnabled is set to false", () => {
    cfg.clickCollectionEnabled = false;
    attachClickActivityCollector(cfg, mockEventManager, mockLifeCycle);
    expect(document.addEventListener).not.toHaveBeenCalled();
  });
  fit("Publishes onClick lifecycle events at clicks when clickCollectionEnabled is set to true", () => {
    spyOn(mockLifeCycle, "onClick").and.callThrough();
    attachClickActivityCollector(cfg, mockEventManager, mockLifeCycle);
    clickHandler({});
    expect(mockLifeCycle.onClick).toHaveBeenCalled();
  });
});
