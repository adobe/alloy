import createPreprocess from "../../../../../../src/components/Personalization/dom-actions/createPreprocess";

describe("Personalization::dom-actions::createPreprocess", () => {
  let preprocessor1;
  let preprocessor2;
  let preprocess;
  beforeEach(() => {
    preprocessor1 = jasmine.createSpy("preprocessor1");
    preprocessor2 = jasmine.createSpy("preprocessor2");
    preprocess = createPreprocess([preprocessor1, preprocessor2]);
  });

  it("handles an empty action", () => {
    expect(preprocess({})).toEqual({});
  });

  it("passes the data through", () => {
    preprocessor1.and.callFake(data => data);
    preprocessor2.and.callFake(data => data);
    expect(preprocess({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("passes the data through when the preprocessor returns undefined", () => {
    preprocessor1.and.callFake(() => undefined);
    preprocessor2.and.callFake(() => undefined);
    expect(preprocess({ a: 1, b: 2 })).toEqual({ a: 1, b: 2 });
  });

  it("updates the data", () => {
    preprocessor1.and.callFake(() => ({ c: 3 }));
    preprocessor2.and.callFake(() => ({ d: 4 }));
    expect(preprocess({ a: 1, b: 2 })).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });

  it("updates the data2", () => {
    preprocessor1.and.callFake(data => ({ ...data, c: 3 }));
    preprocessor2.and.callFake(data => ({ ...data, d: 4 }));
    expect(preprocess({ a: 1, b: 2 })).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });
});
