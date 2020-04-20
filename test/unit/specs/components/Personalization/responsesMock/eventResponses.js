export const SCOPES_FOO1_FOO2_DECISIONS = [
  {
    id: "TNT:ABC:A",
    scope: "Foo1",
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
      }
    ]
  }
];
export const PAGE_WIDE_SCOPE_DECISIONS_WITHOUT_DOM_ACTION_SCHEMA_ITEMS = [
  {
    id: "TNT:activity1:experience1",
    scope: "__view__",
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
      }
    ]
  }
];
