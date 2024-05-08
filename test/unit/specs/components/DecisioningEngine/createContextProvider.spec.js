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
import createContextProvider from "../../../../../src/components/DecisioningEngine/createContextProvider.js";
import createEventRegistry from "../../../../../src/components/DecisioningEngine/createEventRegistry.js";

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
  it("returns page context", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext()).toEqual(
      jasmine.objectContaining({
        "page.title": "My awesome website",
        "page.url":
          "https://my.web-site.net:8080/about?m=1&t=5&name=jimmy#home",
        "page.path": "/about",
        "page.query": "m=1&t=5&name=jimmy",
        "page.fragment": "home",
        "page.domain": "my.web-site.net",
        "page.subdomain": "my",
        "page.topLevelDomain": "net"
      })
    );
  });
  it("returns referring page context", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext()).toEqual(
      jasmine.objectContaining({
        "referringPage.url": "https://stage.applookout.net/",
        "referringPage.path": "/",
        "referringPage.query": "",
        "referringPage.fragment": "",
        "referringPage.domain": "stage.applookout.net",
        "referringPage.subdomain": "stage",
        "referringPage.topLevelDomain": "net"
      })
    );
  });
  it("returns browser context", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext()).toEqual(
      jasmine.objectContaining({
        "browser.name": "Chrome"
      })
    );
  });
  it("returns windows context", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext()).toEqual(
      jasmine.objectContaining({
        "window.height": 100,
        "window.width": 100,
        "window.scrollY": 10,
        "window.scrollX": 10
      })
    );
  });
  it("includes provided context passed in", () => {
    eventRegistry = createEventRegistry({ storage });
    contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual(
      jasmine.objectContaining({
        cool: "beans"
      })
    );
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

    expect(contextProvider.getContext({ cool: "beans" }).events).toEqual(
      events
    );
  });
});
