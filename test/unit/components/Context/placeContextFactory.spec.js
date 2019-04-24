import placeContextFactory from "../../../../src/components/Context/placeContextFactory";

describe("Context::placeContextFactory", () => {
  let window;
  let event;
  let dateProvider;
  const date = new Date(1553550978123);

  beforeEach(() => {
    window = {
      screen: {
        width: 600,
        height: 800
      }
    };
    event = jasmine.createSpyObj("event", ["mergePlaceContext"]);
    dateProvider = () => {
      return date;
    };
  });

  it("adds placeContext", () => {
    placeContextFactory(window, dateProvider)(event);
    expect(event.mergePlaceContext).toHaveBeenCalledWith({
      localTime: "2019-03-25T21:56:18.123Z",
      // browsers don't have support for setting the timezone on a date object, because of
      // this I cannot have hard-coded integer here because depending on the default
      // timezone of the browser you are testing with you will get different results.
      localTimezoneOffset: date.getTimezoneOffset()
    });
  });
});
