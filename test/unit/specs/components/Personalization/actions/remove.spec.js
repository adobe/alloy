import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Presonalization::actions::remove", () => {
  beforeEach(() => {
    cleanUpDomChanges("remove");
  });

  afterEach(() => {
    cleanUpDomChanges("remove");
  });

  it("should remove element", () => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { remove } = modules;
    const content = `<div id="child"></div>`;
    const element = createNode("div", { id: "remove" }, { innerHTML: content });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = { meta };
    const event = { elements, prehidingSelector: "#remove" };

    return remove(settings, event).then(() => {
      const result = selectNodes("#child");

      expect(result.length).toEqual(0);
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
