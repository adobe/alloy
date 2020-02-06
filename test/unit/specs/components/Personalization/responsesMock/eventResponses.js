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

export const SCOPES_FOO1_FOO3_DECISIONS = [
  {
    id: "TNT:ABC:A3",
    scope: "Foo3",
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
    id: "TNT:ABC:ABC1",
    scope: "Foo1",
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

export const SCOPES_FOO4_FOO5_DECISIONS = [
  {
    id: "TNT:ABC:A4",
    scope: "Foo4",
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
    id: "TNT:ABC:A5",
    scope: "Foo5",
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

export const SAME_SCOPE_MULTIPLE_DECISIONS = [
  {
    id: "TNT:ABC:A4",
    scope: "Foo5",
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
    id: "TNT:ABC:A5",
    scope: "Foo5",
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

export const NO_SCOPES_DECISIONS = [
  {
    id: "TNT:activity1:experience1",
    items: [
      {
        schema: "https://ns.adobe.com/experience/dom-rendering-experience",
        data: [
          {
            type: "setHtml",
            selector: "#foo",
            content: "<div>Hola Mundo</div>"
          }
        ]
      }
    ]
  }
];
