import validateApplyHandles from "../../../../../src/components/DataCollector/validateApplyHandles";

describe("DataCollector::validateApplyHandles", () => {
  it("does not throw error for valid options", () => {
    expect(() => {
      validateApplyHandles({
        options: {
          handles: [
            {
              type: "something:special",
              payload: {}
            }
          ]
        }
      });
    }).not.toThrowError();
  });

  it("throws error for invalid options", () => {
    expect(() => {
      validateApplyHandles({
        options: {
          who_dis: true
        }
      });
    }).toThrowError();
  });
});
