import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Presonalization::actions::setStyle", () => {
  beforeEach(() => {
    cleanUpDomChanges("setStyle");
  });

  afterEach(() => {
    cleanUpDomChanges("setStyle");
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { setStyle } = modules;
    const element = createNode("div", { id: "setStyle" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: { "font-size": "33px", priority: "important" },
      meta
    };
    const event = { elements, prehidingSelector: "#setStyle" };

    setStyle(settings, event);

    expect(elements[0].style.getPropertyValue("font-size")).toEqual("33px");
    expect(collect).toHaveBeenCalledWith(meta);
  });
});
