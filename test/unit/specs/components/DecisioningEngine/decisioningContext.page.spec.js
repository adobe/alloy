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

describe("DecisioningEngine:globalContext:page", () => {
  let applyResponse;
  beforeEach(() => {
    applyResponse = jasmine.createSpy();
  });

  it("satisfies rule based on matched page url", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.url",
          matcher: "eq",
          values: ["https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"]
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

  it("does not satisfy rule due to unmatched page url", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "page.url",
          matcher: "eq",
          values: ["https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"]
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

  it("satisfy rule based on matched domain", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.domain",
          matcher: "eq",
          values: ["pro.mywebsite.org"]
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
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.domain",
          matcher: "eq",
          values: ["pro.mywebsite.com"]
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

  it("satisfied rule based on matched page subdomain", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.subdomain",
          matcher: "eq",
          values: ["pro"]
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
  // Note that we have custom parse url [refer to implementation] which will give empty string in case of www
  it("does not satisfy rule due to unmatched page subdomain", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://www.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.subdomain",
          matcher: "eq",
          values: ["www"]
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

  it("satisfies rule based on matched page topLevelDomain", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.topLevelDomain",
          matcher: "eq",
          values: ["org"]
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

  it("does not satisfy rule due to unmatched page topLevelDomain", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.topLevelDomain",
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

  it("satisfies rule based on matched page path", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.path",
          matcher: "eq",
          values: ["/about"]
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

  it("does not satisfy rule due to unmatched page path", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.path",
          matcher: "eq",
          values: ["/home"]
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

  it("satisfies rule based on matched page query", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.query",
          matcher: "co",
          values: ["name=bob"]
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

  it("does not satisfy rule due to unmatched page query", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=richard#home"
      }),
      {
        definition: {
          key: "page.query",
          matcher: "co",
          values: ["name=bob"]
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

  it("satisfies rule based on matched page fragment", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#home"
      }),
      {
        definition: {
          key: "page.fragment",
          matcher: "eq",
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

  it("does not satisfy rule due to unmatched page fragment", () => {
    setupResponseHandler(
      applyResponse,
      mockWindow({
        url: "https://pro.mywebsite.org:8080/about?m=1&t=5&name=bob#about"
      }),
      {
        definition: {
          key: "page.fragment",
          matcher: "eq",
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
