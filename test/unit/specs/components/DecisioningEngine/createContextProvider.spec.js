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
import parseUrl from "../../../../../src/utils/parseUrl";
// TODO: Need to mock url using some library like sinon, also write comprehensive tests for all the scenarios
describe("DecisioningEngine:createContextProvider", () => {
  let contextProvider;
  let eventRegistry;

  let storage;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);

    spyOnProperty(document, "title").and.returnValue("My awesome website");
    spyOnProperty(document, "referrer").and.returnValue(
      "https://stage.applookout.net/"
    );
    spyOnProperty(window, "innerHeight").and.returnValue(887);
    spyOnProperty(window, "innerWidth").and.returnValue(1200);

    jasmine.clock().install();
    const mockedTimestamp = new Date("2023-05-05T11:38:06.107Z");
    jasmine.clock().mockDate(mockedTimestamp);
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
      currentTimestamp: 1683286686107,
      currentHour: 4,
      currentMinute: 38,
      currentYear: 2023,
      currentMonth: 4,
      currentDate: 5,
      currentDay: 5,
      pageLoadTime: 1683286686107,
      pageVisitDuration: 0,
      browser: {
        name: "Chrome"
      },
      window: {
        height: 887,
        width: 1200,
        scrollY: 0,
        scrollX: 0
      },
      page: {
        title: "My awesome website",
        url: window.location.href,
        path: parseUrl(window.location.href).path,
        query: parseUrl(window.location.href).query,
        fragment: parseUrl(window.location.href).fragment,
        domain: parseUrl(window.location.href).domain,
        subdomain: parseUrl(window.location.href).subdomain,
        topLevelDomain: parseUrl(window.location.href).topLevelDomain
      },
      referringPage: {
        url: "https://stage.applookout.net/",
        path: "/",
        query: "",
        fragment: "",
        domain: "stage.applookout.net",
        subdomain: "stage",
        topLevelDomain: "net"
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
      currentTimestamp: 1683286686107,
      currentHour: 4,
      currentMinute: 38,
      currentYear: 2023,
      currentMonth: 4,
      currentDate: 5,
      currentDay: 5,
      pageLoadTime: 1683286686107,
      pageVisitDuration: 0,
      browser: {
        name: "Chrome"
      },
      window: {
        height: 887,
        width: 1200,
        scrollY: 0,
        scrollX: 0
      },
      page: {
        title: "My awesome website",
        url: window.location.href,
        path: parseUrl(window.location.href).path,
        query: parseUrl(window.location.href).query,
        fragment: parseUrl(window.location.href).fragment,
        domain: parseUrl(window.location.href).domain,
        subdomain: parseUrl(window.location.href).subdomain,
        topLevelDomain: parseUrl(window.location.href).topLevelDomain
      },
      referringPage: {
        url: "https://stage.applookout.net/",
        path: "/",
        query: "",
        fragment: "",
        domain: "stage.applookout.net",
        subdomain: "stage",
        topLevelDomain: "net"
      }
    });
  });
});
