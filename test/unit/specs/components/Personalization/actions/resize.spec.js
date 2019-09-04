import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::resize", () => {
  beforeEach(() => {
    cleanUpDomChanges("resize");
  });

  afterEach(() => {
    cleanUpDomChanges("resize");
  });

  it("should resize personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { resize } = modules;
    const element = createNode("div", { id: "resize" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#resize",
      prehidingSelector: "#resize",
      content: { width: "100px", height: "100px" }
    };
    const event = { notify };

    return resize(settings, event).then(() => {
      expect(elements[0].style.width).toEqual("100px");
      expect(elements[0].style.height).toEqual("100px");
      expect(notify).toHaveBeenCalled();
    });
  });
});
