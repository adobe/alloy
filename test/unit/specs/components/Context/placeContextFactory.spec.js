import placeContextFactory from "../../../../../src/components/Context/placeContextFactory";

describe("Context::placeContextFactory", () => {
  let event;
  let dateProvider;
  const date = new Date("March 25, 2019 21:56:18");

  beforeEach(() => {
    event = jasmine.createSpyObj("event", ["mergePlaceContext"]);
    dateProvider = () => {
      return date;
    };
  });

  it("adds placeContext", () => {
    spyOn(date, "getTimezoneOffset").and.returnValue(7 * 60);
    placeContextFactory(dateProvider)(event);
    expect(event.mergePlaceContext).toHaveBeenCalledWith({
      localTime: "2019-03-25T21:56:18.000-07:00",
      localTimezoneOffset: 7 * 60
    });
  });
});
