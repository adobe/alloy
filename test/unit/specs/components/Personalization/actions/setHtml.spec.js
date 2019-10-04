import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
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
});
