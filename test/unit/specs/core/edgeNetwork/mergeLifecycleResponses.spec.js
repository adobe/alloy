import mergeLifecycleResponses from "../../../../../src/core/edgeNetwork/mergeLifecycleResponses";

describe("mergeLifecycleResponses", () => {
  it("works", () => {
    expect(
      mergeLifecycleResponses([
        [
          null,
          {
            destinations: []
          },
          null,
          {
            inferences: []
          }
        ],
        [
          {
            propositions: []
          },
          {
            decisions: [
              {
                id:
                  "AT:eyJhY3Rpdml0eUlkIjoiNTYzMTcwIiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
                scope: "superfluous",
                items: [
                  {
                    id: "780724",
                    schema:
                      "https://ns.adobe.com/personalization/html-content-item",
                    data: {
                      id: "1",
                      format: "text/html",
                      content: "<div>hi</div>"
                    }
                  }
                ]
              }
            ],
            propositions: [
              {
                renderAttempted: true,
                id:
                  "AT:eyJhY3Rpdml0eUlkIjoiNTYzMTY5IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
                scope: "__view__",
                items: [
                  {
                    id: "0",
                    schema: "https://ns.adobe.com/personalization/dom-action",
                    data: {
                      type: "insertAfter",
                      format: "application/vnd.adobe.target.dom-action",
                      content: "<div>hai</div>",
                      selector: "HTML > BODY > H3:nth-of-type(1)",
                      prehidingSelector: "HTML > BODY > H3:nth-of-type(1)"
                    }
                  }
                ]
              }
            ]
          }
        ]
      ])
    ).toEqual({
      destinations: [],
      inferences: [],
      propositions: [
        {
          renderAttempted: true,
          id: "AT:eyJhY3Rpdml0eUlkIjoiNTYzMTY5IiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
          scope: "__view__",
          items: [
            {
              id: "0",
              schema: "https://ns.adobe.com/personalization/dom-action",
              data: {
                type: "insertAfter",
                format: "application/vnd.adobe.target.dom-action",
                content: "<div>hai</div>",
                selector: "HTML > BODY > H3:nth-of-type(1)",
                prehidingSelector: "HTML > BODY > H3:nth-of-type(1)"
              }
            }
          ]
        }
      ],
      decisions: [
        {
          id: "AT:eyJhY3Rpdml0eUlkIjoiNTYzMTcwIiwiZXhwZXJpZW5jZUlkIjoiMCJ9",
          scope: "superfluous",
          items: [
            {
              id: "780724",
              schema: "https://ns.adobe.com/personalization/html-content-item",
              data: {
                id: "1",
                format: "text/html",
                content: "<div>hi</div>"
              }
            }
          ]
        }
      ]
    });
  });
});
