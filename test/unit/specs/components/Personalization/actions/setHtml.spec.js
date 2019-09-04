import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
  });

  it("should set personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { setHtml } = modules;
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#setHtml",
      prehidingSelector: "#setHtml",
      content: "bar"
    };
    const event = { notify };

    return setHtml(settings, event).then(() => {
      expect(elements[0].innerHTML).toEqual("bar");
      expect(notify).toHaveBeenCalled();
    });
  });
});
