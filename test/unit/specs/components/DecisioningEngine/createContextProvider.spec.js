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
import createContextProvider from "../../../../../src/components/DecisioningEngine/createContextProvider";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry";

describe("DecisioningEngine:createContextProvider", () => {
  let contextProvider;
  let eventRegistry;

  let storage;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);

    spyOnProperty(document, "title").and.returnValue("Title");
    spyOnProperty(document, "referrer").and.returnValue("http://localhost/");
    spyOnProperty(window, "innerHeight").and.returnValue(887);
    spyOnProperty(window, "innerWidth").and.returnValue(1200);

    jasmine.clock().install();
    const mockedTime = new Date("2023-05-05T11:38:06.107Z");
    jasmine.clock().mockDate(mockedTime);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it("includes provided context passed in", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual({
      cool: "beans",
      events: {},
      timePageLoaded: 1683286686107,
      datePageLoaded: 5,
      dayPageLoaded: 5,
      currentDate: 5,
      currentTime: 1683286686107,
      currentDay: 5,
      scrollPosition: 0,
      browserDetails: {
        browserName: "Google Chrome",
        browserVersion: "112.0"
      },
      pageContext: {
        pageName: "Title",
        pageURL: window.location.href,
        pageReferrer: "http://localhost/",
        pageHeight: 887,
        pageWidth: 1200
      }
    });
  });

  it("includes events context", () => {
    const events = {
      abc: {
        event: { id: "abc", type: "display" },
        timestamp: new Date().getTime(),
        count: 1
      }
    };

    eventRegistry = {
      toJSON: () => events
    };
    contextProvider = createContextProvider({ eventRegistry });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual({
      cool: "beans",
      events,
      timePageLoaded: 1683286686107,
      datePageLoaded: 5,
      dayPageLoaded: 5,
      currentDate: 5,
      currentTime: 1683286686107,
      currentDay: 5,
      scrollPosition: 0,
      browserDetails: {
        browserName: "Google Chrome",
        browserVersion: "112.0"
      },
      pageContext: {
        pageName: "Title",
        pageURL: window.location.href,
        pageReferrer: "http://localhost/",
        pageHeight: 887,
        pageWidth: 1200
      }
    });
  });
});
