import injectEnvironment from "../../../../../src/components/Context/injectEnvironment";

describe("Context::injectEnvironment", () => {
  const mywindow = {
    screen: { width: 1001, height: 1002 },
    innerWidth: 1003,
    innerHeight: 1004
  };

  it("works", () => {
    const date = new Date(1553550978123);
    const dateProvider = () => {
      return date;
    };
    const xdm = {};
    injectEnvironment(mywindow, dateProvider)(xdm);
    expect(xdm).toEqual({
      environment: {
        type: "browser",
        browserDetails: {
          viewportWidth: 1003,
          viewportHeight: 1004
        }
      }
    });
  });
});
