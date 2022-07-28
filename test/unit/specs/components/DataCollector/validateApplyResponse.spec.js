import validateApplyResponse from "../../../../../src/components/DataCollector/validateApplyResponse";

describe("DataCollector::validateApplyResponse", () => {
  it("does not throw error for valid options", () => {
    expect(() => {
      validateApplyResponse({
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
      validateApplyResponse({
        options: {
          who_dis: true
        }
      });
    }).toThrowError();
  });
});
