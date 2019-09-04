import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::prependHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  it("should prepend personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { prependHtml } = modules;
    const content = `<li>3</li>`;
    const element = createNode(
      "ul",
      { id: "prependHtml" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const settings = {
      selector: "#prependHtml",
      prehidingSelector: "#prependHtml",
      content: `<li>1</li><li>2</li>`
    };
    const event = { notify };

    return prependHtml(settings, event).then(() => {
      const result = selectNodes("ul#prependHtml li");

      expect(result.length).toEqual(3);
      expect(result[0].innerHTML).toEqual("1");
      expect(result[1].innerHTML).toEqual("2");
      expect(result[2].innerHTML).toEqual("3");
      expect(notify).toHaveBeenCalled();
    });
  });
});
