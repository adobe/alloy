import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setAttribute", () => {
  beforeEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  afterEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  it("should set element attribute", () => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { setAttribute } = modules;
    const element = createNode("div", { id: "setAttribute" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = { content: { "data-test": "bar" }, meta };
    const event = { elements, prehidingSelector: "#setAttribute" };

    return setAttribute(settings, event).then(() => {
      expect(elements[0].getAttribute("data-test")).toEqual("bar");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
