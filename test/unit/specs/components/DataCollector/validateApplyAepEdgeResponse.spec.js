import validateApplyAepEdgeResponse from "../../../../../src/components/DataCollector/validateApplyAepEdgeResponse";

describe("DataCollector::validateApplyAepEdgeResponse", () => {
  it("does not throw error for valid options", () => {
    expect(() => {
      validateApplyAepEdgeResponse({
        options: {
          responseBody: {
            handle: [
              {
                type: "something:special",
                payload: {}
              }
            ]
          }
        }
      });
    }).not.toThrowError();
  });

  it("throws error for invalid options", () => {
    expect(() => {
      validateApplyAepEdgeResponse({
        options: {
          who_dis: true
        }
      });
    }).toThrowError();
  });
});
