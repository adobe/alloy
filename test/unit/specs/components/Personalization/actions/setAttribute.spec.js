import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::setAttribute", () => {
  beforeEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  afterEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  it("should set element attribute", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { setAttribute } = modules;
    const element = createNode("div", { id: "setAttribute" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#setAttribute",
      prehidingSelector: "#setAttribute",
      content: { "data-test": "bar" }
    };
    const event = { notify };

    return setAttribute(settings, event).then(() => {
      expect(elements[0].getAttribute("data-test")).toEqual("bar");
      expect(notify).toHaveBeenCalled();
    });
  });
});
