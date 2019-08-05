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

  it("should set personalized content", done => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = { content: "bar", meta };
    const event = { elements, prehidingSelector: "#setHtml" };

    setHtml(settings, event)
      .then(() => {
        expect(elements[0].innerHTML).toEqual("bar");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Should not fail");
        done();
      });
  });
});
