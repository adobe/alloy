import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::resize", () => {
  beforeEach(() => {
    cleanUpDomChanges("resize");
  });

  afterEach(() => {
    cleanUpDomChanges("resize");
  });

  it("should set personalized content", done => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { resize } = modules;
    const element = createNode("div", { id: "resize" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: { width: "100px", height: "100px" },
      meta
    };
    const event = { elements, prehidingSelector: "#resize" };

    resize(settings, event)
      .then(() => {
        expect(elements[0].style.width).toEqual("100px");
        expect(elements[0].style.height).toEqual("100px");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Should not fail");
        done();
      });
  });
});
