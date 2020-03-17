import finallyHelper from "../../../../src/utils/finallyHelper";
import { defer } from "../../../../src/utils";

describe("utils:finallyHelper", () => {
  it("runs when the promise is resolved", () => {
    const deferred = defer();
    const action = jasmine.createSpy("action");
    const promise = finallyHelper(deferred.promise, action);
    expect(action).not.toHaveBeenCalled();
    deferred.resolve("myresult");
    return promise.then(result => {
      expect(action).toHaveBeenCalledWith();
      expect(result).toEqual("myresult");
    });
  });

  it("runs when the promise is rejected", () => {
    const deferred = defer();
    const action = jasmine.createSpy("action");
    const promise = finallyHelper(deferred.promise, action);
    expect(action).not.toHaveBeenCalled();
    const myerror = new Error("myerror");
    deferred.reject(myerror);
    return promise.catch(error => {
      expect(action).toHaveBeenCalledWith();
      expect(error).toEqual(myerror);
    });
  });
});
