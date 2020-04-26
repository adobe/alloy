import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
    delete window.someEvar123;
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
    delete window.someEvar123;
  });

  it("should set personalized content", () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: "bar",
      meta
    };
    const event = { elements };

    return setHtml(settings, event).then(() => {
      expect(elements[0].innerHTML).toEqual("bar");
    });
  });

  it("should execute inline JavaScript", () => {
    const modules = initDomActionsModules();
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: "<script>window.someEvar123 = 1;</script>",
      meta
    };
    const event = { elements };

    return setHtml(settings, event).then(() => {
      expect(window.someEvar123).toEqual(1);
    });
  });
});
