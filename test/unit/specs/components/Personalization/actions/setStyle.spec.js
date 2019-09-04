import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Presonalization::actions::setStyle", () => {
  beforeEach(() => {
    cleanUpDomChanges("setStyle");
  });

  afterEach(() => {
    cleanUpDomChanges("setStyle");
  });

  it("should set styles", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { setStyle } = modules;
    const element = createNode("div", { id: "setStyle" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#setStyle",
      prehidingSelector: "#setStyle",
      content: { "font-size": "33px", priority: "important" }
    };
    const event = { notify };

    return setStyle(settings, event).then(() => {
      expect(elements[0].style.getPropertyValue("font-size")).toEqual("33px");
      expect(notify).toHaveBeenCalled();
    });
  });
});
