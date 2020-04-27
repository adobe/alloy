import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::appendHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  it("should append personalized content", () => {
    const modules = initDomActionsModules();
    const { appendHtml } = modules;
    const content = `<li>1</li>`;
    const element = createNode(
      "ul",
      { id: "appendHtml" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#appendHtml",
      prehidingSelector: "#appendHtml",
      content: `<li>2</li><li>3</li>`,
      meta
    };

    return appendHtml(settings).then(() => {
      const result = selectNodes("ul#appendHtml li");

      expect(result.length).toEqual(3);
      expect(result[0].innerHTML).toEqual("1");
      expect(result[1].innerHTML).toEqual("2");
      expect(result[2].innerHTML).toEqual("3");
    });
  });
});
