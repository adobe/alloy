import inAppMessageConsequenceAdapter from "../../../../../../src/components/DecisioningEngine/consequenceAdapters/inAppMessageConsequenceAdapter";

describe("DecisioningEngine:inAppMessageConsequenceAdapter", () => {
  it("works", () => {
    expect(
      inAppMessageConsequenceAdapter(
        "72042c7c-4e34-44f6-af95-1072ae117424",
        "cjmiam",
        {
          mobileParameters: {
            verticalAlign: "center",
            dismissAnimation: "top",
            verticalInset: 0,
            backdropOpacity: 0.2,
            cornerRadius: 15,
            horizontalInset: 0,
            uiTakeover: true,
            horizontalAlign: "center",
            width: 80,
            displayAnimation: "top",
            backdropColor: "#000000",
            height: 60
          },
          html: "<!doctype html><div>modal</div></html>"
        }
      )
    ).toEqual({
      schema: "https://ns.adobe.com/personalization/message/in-app",
      data: {
        type: "modal",
        mobileParameters: {
          verticalAlign: "center",
          dismissAnimation: "top",
          verticalInset: 0,
          backdropOpacity: 0.2,
          cornerRadius: 15,
          horizontalInset: 0,
          uiTakeover: true,
          horizontalAlign: "center",
          width: 80,
          displayAnimation: "top",
          backdropColor: "#000000",
          height: 60
        },
        webParameters: jasmine.any(Object),
        content: "<!doctype html><div>modal</div></html>",
        contentType: "text/html"
      },
      id: "72042c7c-4e34-44f6-af95-1072ae117424"
    });
  });
});
