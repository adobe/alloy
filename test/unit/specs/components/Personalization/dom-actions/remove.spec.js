import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::remove", () => {
  beforeEach(() => {
    cleanUpDomChanges("remove");
  });

  afterEach(() => {
    cleanUpDomChanges("remove");
  });

  it("should remove element", () => {
    const modules = initDomActionsModules();
    const { remove } = modules;
    const content = `<div id="child"></div>`;
    const element = createNode("div", { id: "remove" }, { innerHTML: content });

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#remove",
      prehidingSelector: "#remove",
      meta
    };

    return remove(settings).then(() => {
      const result = selectNodes("#child");

      expect(result.length).toEqual(0);
    });
  });
});
