import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
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
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
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
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });

  it("should execute inline JavaScript", () => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
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
      expect(collect).toHaveBeenCalledWith(meta);
      expect(window.someEvar123).toEqual(1);
    });
  });
});
