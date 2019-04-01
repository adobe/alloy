import getBrowserInfo from "../../../../src/components/Context/getBrowserInfo";

describe("Context::getBrowserInfo", () => {
  const mywindow = {
    screen: { width: 1001, height: 1002 },
    innerWidth: 1003,
    innerHeight: 1004,
    navigator: { connection: { effectiveType: "myConnectionType" } }
  };
  it("works", () => {
    expect(getBrowserInfo(mywindow)).toEqual({
      resolution: "1001x1002",
      browserWidth: 1003,
      browserHeight: 1004,
      connectionType: "myConnectionType"
    });
  });
});
