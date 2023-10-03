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
import {
  mockWindow,
  setupResponseHandler,
  proposition
} from "./contextTestUtils";

describe("DecisioningEngine:globalContext:referringPage", () => {
  let applyResponse;
  beforeEach(() => {
    applyResponse = jasmine.createSpy();
  });

  it("satisfies rule based on matched domain", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://business.adobe.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer#home"
      }),
      {
        definition: {
          key: "referringPage.domain",
          matcher: "eq",
          values: ["business.adobe.com"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched domain", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "referringPage.domain",
          matcher: "co",
          values: ["business.adobe.com"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched referringPage subdomain", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://business.adobe.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer#home"
      }),
      {
        definition: {
          key: "referringPage.subdomain",
          matcher: "co",
          values: ["business"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched subdomain", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "referringPage.subdomain",
          matcher: "eq",
          values: ["business"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched referringPage topLevelDomain", async () => {
    await setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "referringPage.topLevelDomain",
        matcher: "eq",
        values: ["com"]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched topLevelDomain", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "referringPage.topLevelDomain",
          matcher: "eq",
          values: ["com"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched referringPage path", async () => {
    await setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "referringPage.path",
        matcher: "co",
        values: ["/search"]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched referringPage path", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "referringPage.path",
          matcher: "co",
          values: ["/search"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched referringPage query", async () => {
    await setupResponseHandler(applyResponse, mockWindow({}), {
      definition: {
        key: "referringPage.query",
        matcher: "co",
        values: ["q=adobe+journey+optimizer&oq=adobe+journey+optimizer"]
      },
      type: "matcher"
    });

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule due to unmatched referringPage query", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "referringPage.query",
          matcher: "co",
          values: ["q=adobe+journey+optimizer&oq=adobe+journey+optimizer"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });

  it("satisfies rule based on matched referringPage fragment", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer:
          "https://business.adobe.com/search?q=adobe+journey+optimizer&oq=adobe+journey+optimizer#home"
      }),
      {
        definition: {
          key: "referringPage.fragment",
          matcher: "co",
          values: ["home"]
        },
        type: "matcher"
      }
    );

    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: [proposition]
      })
    );
  });

  it("does not satisfy rule based on unmatched referringPage fragment", async () => {
    await setupResponseHandler(
      applyResponse,
      mockWindow({
        referrer: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#about"
      }),
      {
        definition: {
          key: "referringPage.fragment",
          matcher: "co",
          values: ["home"]
        },
        type: "matcher"
      }
    );
    expect(applyResponse).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        propositions: []
      })
    );
  });
});
