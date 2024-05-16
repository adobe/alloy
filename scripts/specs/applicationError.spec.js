import ApplicationError from "../helpers/applicationError.js";

describe("ApplicationError", () => {
  it("sets the name of the error", () => {
    try {
      throw new ApplicationError("foo");
    } catch (e) {
      expect(e.name).toEqual("ApplicationError");
    }
  });
  it("works with instanceof", () => {
    try {
      throw new ApplicationError("foo");
    } catch (e) {
      expect(e instanceof ApplicationError).toBeTrue();
    }
  });
});
