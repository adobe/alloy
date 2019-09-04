import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::setText", () => {
  beforeEach(() => {
    cleanUpDomChanges("setText");
  });

  afterEach(() => {
    cleanUpDomChanges("setText");
  });

  it("should set personalized text", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { setText } = modules;
    const element = createNode("div", { id: "setText" });
    element.textContent = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#setText",
      prehidingSelector: "#setText",
      content: "bar"
    };
    const event = { notify };

    return setText(settings, event).then(() => {
      expect(elements[0].textContent).toEqual("bar");
      expect(notify).toHaveBeenCalled();
    });
  });
});
