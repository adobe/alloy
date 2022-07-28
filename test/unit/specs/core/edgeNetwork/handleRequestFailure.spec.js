import handleRequestFailure from "../../../../../src/core/edgeNetwork/handleRequestFailure";

describe("handleRequestFailure", () => {
  it("works", () => {
    const onRequestFailureCallbackAggregator = jasmine.createSpyObj(
      "onRequestFailureCallbackAggregator",
      ["add", "call"]
    );

    onRequestFailureCallbackAggregator.call.and.returnValue(Promise.resolve());

    const error = new Error("woopsie");

    handleRequestFailure(onRequestFailureCallbackAggregator)(error).catch(
      err => {
        expect(onRequestFailureCallbackAggregator.call).toHaveBeenCalledWith({
          error
        });
        expect(err).toEqual(error);
      }
    );
  });
});
