import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::appendHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  it("should append personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { appendHtml } = modules;
    const content = `<li>1</li>`;
    const element = createNode(
      "ul",
      { id: "appendHtml" },
      { innerHTML: content }
    );
    appendNode(document.body, element);

    const settings = {
      selector: "#appendHtml",
      prehidingSelector: "#appendHtml",
      content: `<li>2</li><li>3</li>`
    };
    const event = { notify };

    return appendHtml(settings, event).then(() => {
      const result = selectNodes("ul#appendHtml li");

      expect(result.length).toEqual(3);
      expect(result[0].innerHTML).toEqual("1");
      expect(result[1].innerHTML).toEqual("2");
      expect(result[2].innerHTML).toEqual("3");
      expect(notify).toHaveBeenCalled();
    });
  });
});
