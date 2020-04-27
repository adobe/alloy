import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::replaceHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  it("should replace element with personalized content", () => {
    const modules = initDomActionsModules();
    const { replaceHtml } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "rh" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "replaceHtml" }, {}, [child]);

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="rh">BBB</div>`,
      meta
    };

    return replaceHtml(settings).then(() => {
      const result = selectNodes("div#replaceHtml .rh");

      expect(result.length).toEqual(1);
      expect(result[0].innerHTML).toEqual("BBB");
    });
  });
});
