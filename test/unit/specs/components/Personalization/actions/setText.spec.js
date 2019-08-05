import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setText", () => {
  beforeEach(() => {
    cleanUpDomChanges("setText");
  });

  afterEach(() => {
    cleanUpDomChanges("setText");
  });

  it("should set personalized text", done => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { setText } = modules;
    const element = createNode("div", { id: "setText" });
    element.textContent = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = { content: "bar", meta };
    const event = { elements, prehidingSelector: "#setText" };

    setText(settings, event)
      .then(() => {
        expect(elements[0].textContent).toEqual("bar");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Should not fail");
        done();
      });
  });
});
