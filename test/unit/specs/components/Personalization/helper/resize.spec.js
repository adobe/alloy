import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::resize", () => {
  beforeEach(() => {
    cleanUpDomChanges("resize");
  });

  afterEach(() => {
    cleanUpDomChanges("resize");
  });

  it("should resize personalized content", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { resize } = modules;
    const element = createNode("div", { id: "resize" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#resize",
      prehidingSelector: "#resize",
      content: { width: "100px", height: "100px" },
      meta
    };

    return resize(settings).then(() => {
      expect(elements[0].style.width).toEqual("100px");
      expect(elements[0].style.height).toEqual("100px");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
