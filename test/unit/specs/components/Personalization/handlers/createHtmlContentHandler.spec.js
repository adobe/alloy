import createHtmlContentHandler from "../../../../../../src/components/Personalization/handlers/createHtmlContentHandler";

xdescribe("Personalization::handlers::createHtmlContentHandler", () => {
  let next;
  let modules;
  let action1;
  let action2;
  let preprocess;
  let proposition;
  let handle;
  let handler;

  beforeEach(() => {
    next = jasmine.createSpy("next");
    action1 = jasmine.createSpy("action1");
    action2 = jasmine.createSpy("action2");
    modules = { action1, action2 };
    preprocess = jasmine.createSpy("preprocess");
    preprocess.and.returnValue("preprocessed");
    proposition = jasmine.createSpyObj("proposition1", [
      "getHandle",
      "includeInDisplayNotification",
      "addRenderer",
      "isApplyPropositions"
    ]);
    proposition.getHandle.and.callFake(() => handle);
    handler = createHtmlContentHandler({
      next,
      modules,
      preprocess
    });
  });

  it("handles an empty proposition", () => {
    handle = {};
    handler(proposition);
    expect(next).not.toHaveBeenCalled();
    expect(action1).not.toHaveBeenCalled();
    expect(action2).not.toHaveBeenCalled();
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
    expect(preprocess).not.toHaveBeenCalled();
  });

  it("does not filter a view scope type", () => {
    handle = { scopeDetails: { characteristics: { scopeType: "view" } } };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("does not filter a page wide scope", () => {
    handle = { scope: "__view__" };
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("does not filter an apply propositions call", () => {
    handle = {};
    proposition.isApplyPropositions.and.returnValue(true);
    handler(proposition);
    expect(next).toHaveBeenCalledOnceWith(proposition);
  });

  it("handles a HTML content item", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/html-content-item",
          data: { type: "action1", selector: "selector1" }
        }
      ]
    };
    handler(proposition);
    expect(proposition.addRenderer).toHaveBeenCalledOnceWith(
      0,
      jasmine.any(Function)
    );
    expect(proposition.includeInDisplayNotification).toHaveBeenCalledOnceWith();
    proposition.addRenderer.calls.argsFor(0)[1]();
    expect(action1).toHaveBeenCalledOnceWith("preprocessed");
  });

  it("does not handle an HTML content item with an unknown type", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/html-content-item",
          data: { type: "unknown", selector: "selector1" }
        }
      ]
    };
    handler(proposition);
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
  });

  it("does not handle an HTML content item without a selector", () => {
    handle = {
      items: [
        {
          schema: "https://ns.adobe.com/personalization/html-content-item",
          data: { type: "action1" }
        }
      ]
    };
    handler(proposition);
    expect(proposition.addRenderer).not.toHaveBeenCalled();
    expect(proposition.includeInDisplayNotification).not.toHaveBeenCalled();
  });
});
