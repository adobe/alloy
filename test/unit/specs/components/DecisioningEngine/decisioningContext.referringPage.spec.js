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

  it("satisfies rule based on matched domain", () => {
    setupResponseHandler(
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

  it("does not satisfy rule due to unmatched domain", () => {
    setupResponseHandler(
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

  it("satisfies rule based on matched referringPage subdomain", () => {
    setupResponseHandler(
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

  it("does not satisfy rule due to unmatched subdomain", () => {
    setupResponseHandler(
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

  it("satisfies rule based on matched referringPage topLevelDomain", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
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

  it("does not satisfy rule due to unmatched topLevelDomain", () => {
    setupResponseHandler(
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

  it("satisfies rule based on matched referringPage path", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
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

  it("does not satisfy rule due to unmatched referringPage path", () => {
    setupResponseHandler(
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

  it("satisfies rule based on matched referringPage query", () => {
    setupResponseHandler(applyResponse, mockWindow({}), {
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

  it("does not satisfy rule due to unmatched referringPage query", () => {
    setupResponseHandler(
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

  it("satisfies rule based on matched referringPage fragment", () => {
    setupResponseHandler(
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

  it("does not satisfy rule based on unmatched referringPage fragment", () => {
    setupResponseHandler(
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
