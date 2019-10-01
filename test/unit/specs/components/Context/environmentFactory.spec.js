import environmentFactory from "../../../../../src/components/Context/environmentFactory";

describe("Context::environmentFactory", () => {
  const mywindow = {
    screen: { width: 1001, height: 1002 },
    innerWidth: 1003,
    innerHeight: 1004
  };
  let event;

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergeXdm"]);
  });

  it("works", () => {
    const date = new Date(1553550978123);
    const dateProvider = () => {
      return date;
    };
    environmentFactory(mywindow, dateProvider)(event);
    expect(event.mergeXdm).toHaveBeenCalledWith({
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
