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
import createIndexedDB from "../../../../../src/components/DecisioningEngine/createIndexedDB";

describe("DecisioningEngine:createContextProvider", () => {
  let window;
  let mockedTimestamp;
  let indexedDB;

  beforeAll(async () => {
    indexedDB = createIndexedDB();
    await indexedDB.setupIndexedDB();
  });

  beforeEach(async () => {
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

  afterAll(async () => {
    await indexedDB.clearIndexedDB();
    indexedDB.getIndexDB().close();
  });

  afterEach(async () => {
    jasmine.clock().uninstall();
  });

  it("returns page context", async () => {
    const eventRegistry = createEventRegistry({ indexedDB });
    const contextProvider = createContextProvider({ eventRegistry, window });

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
  it("returns referring page context", async () => {
    const eventRegistry = createEventRegistry({ indexedDB });
    const contextProvider = createContextProvider({ eventRegistry, window });

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
  it("returns browser context", async () => {
    const eventRegistry = createEventRegistry({ indexedDB });
    const contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext()).toEqual(
      jasmine.objectContaining({
        "browser.name": "Chrome"
      })
    );
  });
  it("returns windows context", async () => {
    const eventRegistry = createEventRegistry({ indexedDB });
    const contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext()).toEqual(
      jasmine.objectContaining({
        "window.height": 100,
        "window.width": 100,
        "window.scrollY": 10,
        "window.scrollX": 10
      })
    );
  });
  it("includes provided context passed in", async () => {
    const eventRegistry = createEventRegistry({ indexedDB });
    const contextProvider = createContextProvider({ eventRegistry, window });

    expect(contextProvider.getContext({ cool: "beans" })).toEqual(
      jasmine.objectContaining({
        cool: "beans"
      })
    );
  });

  // it("includes events context", async () => {
  //   const events = {
  //     abc: {
  //       event: { "iam.id": "abc", "iam.eventType": "display" },
  //       timestamp: new Date().getTime()
  //     }
  //   };
  //   const eventRegistry = createEventRegistry({ indexedDB });
  //   const contextProvider = createContextProvider({ eventRegistry, window });
  //   // TODO: Oct 4: Do you really need await eventRegistry.getEvents("display", "abc");. You are not using the results.
  //   // eventRegistry = await eventRegistry.getEvents("display", "abc");
  //   // console.log("eventRegistry is ", eventRegistry);
  //
  //   expect(contextProvider.getContext({ cool: "beans" })).toEqual(
  //     events
  //   );
  // });
});
