import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Presonalization::actions::remove", () => {
  beforeEach(() => {
    cleanUpDomChanges("remove");
  });

  afterEach(() => {
    cleanUpDomChanges("remove");
  });

  it("should remove element", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { remove } = modules;
    const content = `<div id="child"></div>`;
    const element = createNode("div", { id: "remove" }, { innerHTML: content });

    appendNode(document.body, element);

    const settings = {
      selector: "#remove",
      prehidingSelector: "#remove"
    };
    const event = { notify };

    return remove(settings, event).then(() => {
      const result = selectNodes("#child");

      expect(result.length).toEqual(0);
      expect(notify).toHaveBeenCalled();
    });
  });
});
