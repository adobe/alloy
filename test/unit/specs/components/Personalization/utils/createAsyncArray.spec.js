import createAsyncArray from "../../../../../../src/components/Personalization/utils/createAsyncArray";
import { defer } from "../../../../../../src/utils";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";

describe("Personalization::utils::createAsyncArray", () => {
  it("should start with an empty array", async () => {
    const asyncArray = createAsyncArray();
    expect(await asyncArray.clear()).toEqual([]);
  });

  it("should add items to the array, and clear the items", async () => {
    const asyncArray = createAsyncArray();
    await asyncArray.concat(Promise.resolve(["myitem1"]));
    expect(await asyncArray.clear()).toEqual(["myitem1"]);
    expect(await asyncArray.clear()).toEqual([]);
  });

  it("should add multiple arrays", async () => {
    const asyncArray = createAsyncArray();
    await asyncArray.concat(Promise.resolve(["myitem1"]));
    await asyncArray.concat(Promise.resolve(["myitem2"]));
    expect(await asyncArray.clear()).toEqual(["myitem1", "myitem2"]);
  });

  it("should wait for items while clearing the array", async () => {
    const asyncArray = createAsyncArray();
    const deferred = defer();
    asyncArray.concat(deferred.promise);
    const clearPromise = asyncArray.clear();
    await flushPromiseChains();
    expectAsync(clearPromise).toBePending();
    deferred.resolve(["myitem1"]);
    expect(await clearPromise).toEqual(["myitem1"]);
  });
});
