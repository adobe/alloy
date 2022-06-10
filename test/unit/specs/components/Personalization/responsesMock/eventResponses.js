export const SCOPES_FOO1_FOO2_DECISIONS = [
  {
    id: "TNT:ABC:A",
    scope: "Foo1",
    scopeDetails: {
      blah: "test"
    },
    items: [
      {
        schema: "https://ns.adove.com/experience/item-article",
        data: {
          id: "1",
          url: "https://foo.com/article/1",
          thumbnailUrl: "https://foo.com/image/1?size=400x300"
        }
      },
      {
        schema: "https://ns.adove.com/experience/item-article",
        data: {
          id: "2",
          url: "https://foo.com/article/2",
          thumbnailUrl: "https://foo.com/image/2?size=400x300"
        }
      },
      {
        schema: "https://ns.adove.com/experience/item-article",
        data: {
          id: "3",
          url: "https://foo.com/article/3",
          thumbnailUrl: "https://foo.com/image/3?size=400x300"
        }
      }
    ]
  },
  {
    id: "TNT:ABC:A",
    scope: "Foo2",
    items: [
      {
        schema: "https://ns.adove.com/experience/item",
        data: {
          id: "A",
          content: "Banner A ...."
        }
      }
    ]
  }
];

export const PAGE_WIDE_SCOPE_DECISIONS = [
  {
    id: "TNT:activity1:experience1",
    scope: "__view__",
    scopeDetails: {
      blah: "test"
    },
    items: [
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo",
          content: "<div>Hola Mundo</div>"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo2",
          content: "<div>here is a target activity</div>"
        }
      },
      {
        schema: "https://ns.adove.com/experience/item",
        data: {
          id: "A",
          content: "Banner A ...."
        }
      },
      {
        schema: "https://ns.adove.com/experience/item",
        data: {
          id: "B",
          content: "Banner B ...."
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/default-content-item"
      }
    ]
  }
];
export const PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS = [
  {
    id: "TNT:activity1:experience1",
    scope: "__view__",
    scopeDetails: {
      blah: "test"
    },
    items: [
      {
        schema: "https://ns.adove.com/experience/item",
        data: {
          id: "A",
          content: "Banner A ...."
        }
      },
      {
        schema: "https://ns.adove.com/experience/item",
        data: {
          id: "B",
          content: "Banner B ...."
        }
      }
    ]
  }
];
export const PAGE_WIDE_SCOPE_DECISIONS_WITH_DOM_ACTION_SCHEMA_ITEMS = [
  {
    id: "TNT:activity1:experience1",
    scope: "__view__",
    scopeDetails: {
      blah: "test"
    },
    items: [
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo",
          content: "<div>Hola Mundo</div>"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo2",
          content: "<div>here is a target activity</div>"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/default-content-item"
      }
    ]
  }
];

export const CART_VIEW_DECISIONS = [
  {
    id: "TNT:activity4:experience9",
    scope: "cart",
    scopeDetails: {
      blah: "test",
      characteristics: {
        scopeType: "view"
      }
    },
    items: [
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo",
          content: "<div>welcome to cart view</div>"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo2",
          content: "<div>here is a target activity for cart view</div>"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/default-content-item"
      }
    ]
  }
];
export const PRODUCTS_VIEW_DECISIONS = [
  {
    id: "TNT:activity3:experience4",
    scope: "products",
    scopeDetails: {
      blah: "test",
      characteristics: {
        scopeType: "view"
      }
    },
    items: [
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo3",
          content: "<div>welcome to products view</div>"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "setHtml",
          selector: "#foo4",
          content: "<div>here is a target activity for products view</div>"
        }
      }
    ]
  }
];
export const REDIRECT_PAGE_WIDE_SCOPE_DECISION = [
  {
    id: "TNT:activity15:experience1",
    scope: "__view__",
    scopeDetails: {
      blah: "test"
    },
    items: [
      {
        schema: "https://ns.adobe.com/personalization/redirect-item",
        data: {
          type: "redirect",
          content: "http://example.com/redirect/offer"
        }
      }
    ]
  }
];
export const MERGED_METRIC_DECISIONS = [
  {
    id: "TNT:activity6:experience1",
    scope: "testScope",
    scopeDetails: {
      eventTokens: {
        display: "displayToken1",
        click: "clickToken1"
      }
    },
    items: [
      {
        id: "0",
        schema: "https://ns.adobe.com/personalization/html-content-item",
        data: {
          id: "0",
          format: "text/html",
          content: "testScope content1"
        }
      },
      {
        schema: "https://ns.adobe.com/personalization/default-content-item"
      },
      {
        schema: "https://ns.adobe.com/personalization/measurement",
        data: {
          type: "click",
          format: "application/vnd.adobe.target.metric"
        }
      }
    ]
  }
];

export const MIXED_PROPOSITIONS = [
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn0=",
    scope: "home",
    items: [
      {
        id: "442358",
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "click",
          format: "application/vnd.adobe.target.dom-action",
          selector: "#root"
        }
      }
    ]
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
    scope: "home",
    items: [
      {
        id: "442359",
        schema: "https://ns.adobe.com/personalization/html-content-item",
        data: {
          content: "<p>Some custom content for the home page</p>",
          format: "text/html",
          id: "1202448"
        }
      }
    ]
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
    scope: "home",
    items: [
      {
        id: "442360",
        schema: "https://ns.adobe.com/personalization/json-content-item",
        data: {
          content: "{'field1': 'custom content'}",
          format: "text/javascript",
          id: "1202449"
        }
      }
    ],
    renderAttempted: false
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiMTQxNjY0IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
    scope: "home",
    items: [
      {
        id: "xcore:personalized-offer:134ce877e13a04ca",
        etag: "4",
        schema:
          "https://ns.adobe.com/experience/offer-management/content-component-html",
        data: {
          id: "xcore:personalized-offer:134ce877e13a04ca",
          format: "text/html",
          language: ["en-us"],
          content: "<p>An html offer from Offer Decisioning</p>",
          characteristics: {
            testing: "true"
          }
        }
      }
    ]
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn1=",
    scope: "__view__",
    renderAttempted: true,
    items: [
      {
        id: "442358",
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "click",
          format: "application/vnd.adobe.target.dom-action",
          selector: "#root"
        }
      }
    ]
  },
  {
    id: "AT:eyJhY3Rpdml0eUlkIjoiNDQyMzU4IiwiZXhwZXJpZW5jZUlkIjoiIn2=",
    scope: "__view__",
    renderAttempted: false,
    items: [
      {
        id: "442379",
        schema: "https://ns.adobe.com/personalization/dom-action",
        data: {
          type: "click",
          format: "application/vnd.adobe.target.dom-action",
          selector: "#root"
        }
      }
    ]
  }
];
