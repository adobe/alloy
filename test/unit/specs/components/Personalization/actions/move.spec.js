import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::move", () => {
  beforeEach(() => {
    cleanUpDomChanges("move");
  });

  afterEach(() => {
    cleanUpDomChanges("move");
  });

  it("should set personalized content", done => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { move } = modules;
    const element = createNode("div", { id: "move" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: { left: "100px", top: "100px" },
      meta
    };
    const event = { elements, prehidingSelector: "#move" };

    move(settings, event)
      .then(() => {
        expect(elements[0].style.left).toEqual("100px");
        expect(elements[0].style.top).toEqual("100px");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Should not fail");
        done();
      });
  });
});
