import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::move", () => {
  beforeEach(() => {
    cleanUpDomChanges("move");
  });

  afterEach(() => {
    cleanUpDomChanges("move");
  });

  it("should move personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { move } = modules;
    const element = createNode("div", { id: "move" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#move",
      prehidingSelector: "#move",
      content: { left: "100px", top: "100px" }
    };
    const event = { notify };

    move(settings, event).then(() => {
      expect(elements[0].style.left).toEqual("100px");
      expect(elements[0].style.top).toEqual("100px");
      expect(notify).toHaveBeenCalled();
    });
  });
});
