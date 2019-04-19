import environmentFactory from "../../../../src/components/Context/environmentFactory";

describe("Context::environmentFactory", () => {
  const mywindow = {
    screen: { width: 1001, height: 1002 },
    innerWidth: 1003,
    innerHeight: 1004,
    navigator: { connection: { effectiveType: "myConnectionType" } }
  };
  let payload;

  beforeEach(() => {
    payload = jasmine.createSpyObj("payload", ["addEnvironment"]);
  });

  it("works", () => {
    const date = new Date(1553550978123);
    const dateProvider = () => {
      return date;
    };
    environmentFactory(mywindow, dateProvider)(payload);
    expect(payload.addEnvironment).toHaveBeenCalledWith({
      type: "browser",
      browserDetails: {
        viewportWidth: 1003,
        viewportHeight: 1004
      },
      connectionType: "myConnectionType"
    });
  });

  const ieWindow = {
    screen: { width: 1001, height: 1002 },
    innerWidth: 1003,
    innerHeight: 1004,
    navigator: {}
  };
  it("works with ie missing connection type", () => {
    const date = new Date(1553550978123);
    const dateProvider = () => {
      return date;
    };
    environmentFactory(ieWindow, dateProvider)(payload);
    expect(payload.addEnvironment).toHaveBeenCalledWith({
      type: "browser",
      browserDetails: {
        viewportWidth: 1003,
        viewportHeight: 1004
      }
    });
  });
});
