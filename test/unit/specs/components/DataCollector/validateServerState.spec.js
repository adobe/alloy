import validateServerState from "../../../../../src/components/DataCollector/validateServerState";

describe("DataCollector::validateServerState", () => {
  it("does not throw error for valid options", () => {
    expect(() => {
      validateServerState({
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
      validateServerState({
        options: {
          who_dis: true
        }
      });
    }).toThrowError();
  });
});
