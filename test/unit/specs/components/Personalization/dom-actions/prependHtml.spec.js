import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::prependHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  it("should prepend personalized content", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { prependHtml } = modules;
    const content = `<li>3</li>`;
    const element = createNode(
      "ul",
      { id: "prependHtml" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#prependHtml",
      prehidingSelector: "#prependHtml",
      content: `<li>1</li><li>2</li>`,
      meta
    };

    return prependHtml(settings).then(() => {
      const result = selectNodes("ul#prependHtml li");

      expect(result.length).toEqual(3);
      expect(result[0].innerHTML).toEqual("1");
      expect(result[1].innerHTML).toEqual("2");
      expect(result[2].innerHTML).toEqual("3");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
