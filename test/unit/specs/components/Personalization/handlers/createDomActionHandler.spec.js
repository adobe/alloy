import createDomActionHandler from "../../../../../../src/components/Personalization/handlers/createDomActionHandler";

describe("Personalization::handlers::createDomActionHandler", () => {
  let next;
  let modules;
  let storeClickMetrics;
  let preprocess;
  let action1;
  let action2;
  let handler;

  let proposition;
  let handle;

  beforeEach(() => {
    next = jasmine.createSpy("next");
    action1 = jasmine.createSpy("action1");
    action2 = jasmine.createSpy("action2");
    modules = { action1, action2 };
    storeClickMetrics = jasmine.createSpy("storeClickMetrics");
    preprocess = jasmine.createSpy("preprocess");
    preprocess.and.returnValue("preprocessed");
    handler = createDomActionHandler({
      next,
      modules,
      storeClickMetrics,
      preprocess
    });
    proposition = jasmine.createSpyObj("proposition1", [
      "getHandle",
      "includeInDisplayNotification",
      "addRenderer",
      "getItemMeta"
    ]);
    proposition.getHandle.and.callFake(() => handle);
    proposition.getItemMeta.and.callFake(index => `meta${index}`);
  });

  it("handles an empty proposition", () => {
    handle = {};
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    expect(storeClickMetrics).not.toHaveBeenCalled();
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });

  it("handles an empty set of items", () => {
    handle = { items: [] };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    expect(storeClickMetrics).not.toHaveBeenCalled();
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });

  it("handles an item with an unknown schema", () => {
    handle = { items: [{ schema: "unknown" }] };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    expect(storeClickMetrics).not.toHaveBeenCalled();
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });

  it("handles a default content item", () => {
    handle = {
      items: [
        { schema: "https://ns.adobe.com/personalization/default-content-item" }
      ]
    };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(proposition.includeInDisplayNotification).toHaveBeenCalledOnceWith();
    expect(proposition.addRenderer).toHaveBeenCalledOnceWith(
      0,
      jasmine.any(Function)
    );
    proposition.addRenderer.calls.argsFor(0)[1]();
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });

  it("handles a click item", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "click",
            selector: "#myselector"
          }
        }
      ]
    };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);

    expect(storeClickMetrics).toHaveBeenCalledOnceWith({
      selector: "#myselector",
      meta: "meta0"
    });
    expect(proposition.addRenderer).toHaveBeenCalledOnceWith(
      0,
      jasmine.any(Function)
    );
    proposition.addRenderer.calls.argsFor(0)[1]();
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });

  it("handles a dom action item", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "action1",
            selector: "#myselector"
          }
        }
      ]
    };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(proposition.includeInDisplayNotification).toHaveBeenCalledOnceWith();
    expect(proposition.addRenderer).toHaveBeenCalledOnceWith(
      0,
      jasmine.any(Function)
    );
    proposition.addRenderer.calls.argsFor(0)[1]();
    expect(action1).toHaveBeenCalledOnceWith("preprocessed");
    expect(action2).not.toHaveBeenCalled();
  });

  it("handles an unknown dom action item", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/dom-action",
          data: {
            type: "unknown",
            selector: "#myselector"
          }
        }
      ]
    };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });
});
