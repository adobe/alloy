import debounce from "../../../../src/utils/debounce";

describe("debounce", () => {
  let callback;

  beforeEach(() => {
    callback = jasmine.createSpy();
  });

  it("calls a function only once", done => {
    const fn = debounce(callback, 150);

    for (let i = 0; i < 10; i += 1) {
      fn("oh", "hai");
    }

    setTimeout(() => {
      expect(callback).toHaveBeenCalledOnceWith("oh", "hai");
      expect(callback).toHaveBeenCalledTimes(1);
      done();
    }, 160);
  });

  it("calls a function only once per delay period", done => {
    const fn = debounce(callback, 10);
    fn("oh", "hai");
    fn("oh", "hai");

    setTimeout(() => {
      fn("cool", "beans");
      expect(callback).toHaveBeenCalledWith("oh", "hai");
      expect(callback).toHaveBeenCalledTimes(1);
    }, 25);

    setTimeout(() => {
      expect(callback).toHaveBeenCalledWith("cool", "beans");
      expect(callback).toHaveBeenCalledTimes(2);
      done();
    }, 50);
  });
});
