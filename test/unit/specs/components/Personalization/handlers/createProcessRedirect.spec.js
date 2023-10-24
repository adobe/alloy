import { defer } from "../../../../../../src/utils";
import flushPromiseChains from "../../../../helpers/flushPromiseChains";
import createProcessRedirect from "../../../../../../src/components/Personalization/handlers/createProcessRedirect";

describe("createProcessRedirect", () => {
  let logger;
  let executeRedirect;
  let collect;
  let collectDefer;
  let item;
  let data;
  let meta;

  let processRedirect;

  beforeEach(() => {
    logger = jasmine.createSpyObj("logger", ["warn"]);
    executeRedirect = jasmine.createSpy("executeRedirect");
    collectDefer = defer();
    collect = jasmine
      .createSpy("collect")
      .and.returnValue(collectDefer.promise);
    item = {
      getData() {
        return data;
      },
      getMeta() {
        return meta;
      }
    };

    processRedirect = createProcessRedirect({
      logger,
      executeRedirect,
      collect
    });
  });

  it("returns an empty object if the item has no data", () => {
    data = undefined;
    expect(processRedirect(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith(
      "Invalid Redirect data",
      undefined
    );
  });

  it("returns an empty object if the item has no content", () => {
    data = { a: 1 };
    expect(processRedirect(item)).toEqual({});
    expect(logger.warn).toHaveBeenCalledWith("Invalid Redirect data", { a: 1 });
  });

  it("redirects", async () => {
    data = { content: "mycontent" };
    meta = "mymetavalue";
    const result = processRedirect(item);
    expect(result).toEqual({
      render: jasmine.any(Function),
      setRenderAttempted: true,
      onlyRenderThis: true
    });
    expect(collect).not.toHaveBeenCalled();
    expect(executeRedirect).not.toHaveBeenCalled();
    const renderPromise = result.render();
    await flushPromiseChains();
    expect(collect).toHaveBeenCalledWith({
      decisionsMeta: ["mymetavalue"],
      documentMayUnload: true
    });
    expect(executeRedirect).not.toHaveBeenCalled();
    collectDefer.resolve();
    await flushPromiseChains();
    expect(executeRedirect).toHaveBeenCalledWith("mycontent");
    expect(await renderPromise).toBeUndefined();
  });

  it("doesn't eat the exception", async () => {
    data = { content: "mycontent" };
    meta = "mymetavalue";
    const result = processRedirect(item);
    const renderPromise = result.render();
    collectDefer.reject("myerror");
    await expectAsync(renderPromise).toBeRejectedWith("myerror");
  });
});
