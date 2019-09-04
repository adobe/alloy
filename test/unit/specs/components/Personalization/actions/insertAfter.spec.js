import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::insertAfter", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  afterEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  it("should insert after personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { insertAfter } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ia" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertAfter" }, {}, [child]);

    appendNode(document.body, element);

    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ia">BBB</div>`
    };
    const event = { notify };

    return insertAfter(settings, event).then(() => {
      const result = selectNodes("div#insertAfter .ia");

      expect(result[0].innerHTML).toEqual("AAA");
      expect(result[1].innerHTML).toEqual("BBB");
      expect(notify).toHaveBeenCalled();
    });
  });
});
