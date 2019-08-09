import { toISOStringLocal } from "../../../../src/utils";

describe("toISOStringLocal", () => {
  it("handles a date in Utah", () => {
    const date = new Date("August 9, 2019 10:59:42");
    spyOn(date, "getTimezoneOffset").and.returnValue(7 * 60);
    expect(toISOStringLocal(date)).toEqual("2019-08-09T10:59:42-07:00");
  });

  it("handles a date in india", () => {
    const date = new Date("December 31, 2019 22:36:00");
    spyOn(date, "getTimezoneOffset").and.returnValue(-5 * 60 - 30);
    expect(toISOStringLocal(date)).toEqual("2019-12-31T22:36:00+05:30");
  });

  it("handles a weird offset", () => {
    const date = new Date("January 01, 2020 00:00:42");
    spyOn(date, "getTimezoneOffset").and.returnValue(-176);
    expect(toISOStringLocal(date)).toEqual("2020-01-01T00:00:42+02:56");
  });

  it("handles a UTC timezone", () => {
    const date = new Date("December 31, 2019 22:36:00");
    spyOn(date, "getTimezoneOffset").and.returnValue(0);
    expect(toISOStringLocal(date)).toEqual("2019-12-31T22:36:00+00:00");
  })
});
