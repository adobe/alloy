import processDefaultContent from "../../../../../../src/components/Personalization/handlers/processDefaultContent";

describe("processDefaultContent", () => {
  it("always renders the default content", () => {
    const result = processDefaultContent();
    expect(result).toEqual({
      setRenderAttempted: true,
      includeInNotification: true
    });
  });
});
