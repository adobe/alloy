import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::insertAfter", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  afterEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  it("should insert after personalized content", () => {
    const modules = initDomActionsModules();
    const { insertAfter } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ia" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertAfter" }, {}, [child]);

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ia">BBB</div>`,
      meta
    };

    return insertAfter(settings).then(() => {
      const result = selectNodes("div#insertAfter .ia");

      expect(result[0].innerHTML).toEqual("AAA");
      expect(result[1].innerHTML).toEqual("BBB");
    });
  });
});
