import placeContextFactory from "../../../../../src/components/Context/placeContextFactory";

describe("Context::placeContextFactory", () => {
  let dateProvider;
  const date = new Date("March 25, 2019 21:56:18");

  beforeEach(() => {
    dateProvider = () => {
      return date;
    };
  });

  it("adds placeContext", () => {
    spyOn(date, "getTimezoneOffset").and.returnValue(7 * 60);
    const xdm = {};
    placeContextFactory(dateProvider)(xdm);
    expect(xdm).toEqual({
      placeContext: {
        localTime: "2019-03-25T21:56:18.000-07:00",
        localTimezoneOffset: 7 * 60
      }
    });
  });
});
