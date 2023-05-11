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
// TODO:  write more comprehensive tests for all the scenarios...in progress
describe("DecisioningEngine:createContextProvider", () => {
  let contextProvider;
  let eventRegistry;
  let storage;
  let window;
  let mockedTimestamp;

  beforeEach(() => {
    storage = jasmine.createSpyObj("storage", ["getItem", "setItem", "clear"]);
    window = {
      title: "My awesome website",
      referrer: "https://stage.applookout.net/",
      url: "https://my.web-site.net:8080/about?m=1&t=5&name=jimmy#home",
      width: 100,
      height: 100,
      scrollX: 10,
      scrollY: 10,
      navigator: {
        userAgent:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.87 Safari/537.36"
      }
    };
    mockedTimestamp = new Date(Date.UTC(2023, 4, 11, 12, 34, 56));
    jasmine.clock().install();
    jasmine.clock().mockDate(mockedTimestamp);
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });
  it("includes provided context passed in", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual({
      cool: "beans",
      events: {},
      currentTimestamp: mockedTimestamp.getTime(),
      currentHour: mockedTimestamp.getHours(),
      currentMinute: mockedTimestamp.getMinutes(),
      currentYear: mockedTimestamp.getFullYear(),
      currentMonth: mockedTimestamp.getMonth(),
      currentDate: mockedTimestamp.getDate(),
      currentDay: mockedTimestamp.getDay(),
      pageLoadTimestamp: mockedTimestamp.getTime(),
      pageVisitDuration: 0,
      browser: {
        name: "Chrome"
      },
      window: {
        height: 100,
        width: 100,
        scrollY: 10,
        scrollX: 10
      },
      page: {
        title: "My awesome website",
        url: "https://my.web-site.net:8080/about?m=1&t=5&name=jimmy#home",
        path: "/about",
        query: "m=1&t=5&name=jimmy",
        fragment: "home",
        domain: "my.web-site.net",
        subdomain: "my",
        topLevelDomain: "net"
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
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual({
      cool: "beans",
      events,
      currentTimestamp: mockedTimestamp.getTime(),
      currentHour: mockedTimestamp.getHours(),
      currentMinute: mockedTimestamp.getMinutes(),
      currentYear: mockedTimestamp.getFullYear(),
      currentMonth: mockedTimestamp.getMonth(),
      currentDate: mockedTimestamp.getDate(),
      currentDay: mockedTimestamp.getDay(),
      pageLoadTimestamp: mockedTimestamp.getTime(),
      pageVisitDuration: 0,
      browser: {
        name: "Chrome"
      },
      window: {
        height: 100,
        width: 100,
        scrollY: 10,
        scrollX: 10
      },
      page: {
        title: "My awesome website",
        url: "https://my.web-site.net:8080/about?m=1&t=5&name=jimmy#home",
        path: "/about",
        query: "m=1&t=5&name=jimmy",
        fragment: "home",
        domain: "my.web-site.net",
        subdomain: "my",
        topLevelDomain: "net"
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
