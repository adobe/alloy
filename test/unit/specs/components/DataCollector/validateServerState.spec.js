import validateServerState from "../../../../../src/components/DataCollector/validateServerState";

describe("DataCollector::validateServerState", () => {
  it("does not throw error for valid options", () => {
    expect(() => {
      validateServerState({
        options: {
          request: {
            headers: {},
            body: {}
          },
          response: {
            headers: {},
            body: {}
          }
        }
      });
    }).not.toThrowError();
  });

  it("throws error for invalid options", () => {
    expect(() => {
      validateServerState({
        options: {
          request: {},
          response: {}
        }
      });
    }).toThrowError();
  });
});
