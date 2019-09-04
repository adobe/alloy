import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::replaceHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  it("should replace element with personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { replaceHtml } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "rh" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "replaceHtml" }, {}, [child]);

    appendNode(document.body, element);

    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="rh">BBB</div>`
    };
    const event = { notify };

    return replaceHtml(settings, event).then(() => {
      const result = selectNodes("div#replaceHtml .rh");

      expect(result.length).toEqual(1);
      expect(result[0].innerHTML).toEqual("BBB");
      expect(notify).toHaveBeenCalled();
    });
  });
});
