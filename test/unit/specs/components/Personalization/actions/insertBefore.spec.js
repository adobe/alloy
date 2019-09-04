import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::insertBefore", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  afterEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  it("should insert before personalized content", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { insertBefore } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ib" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertBefore" }, {}, [child]);

    appendNode(document.body, element);

    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ib">BBB</div>`
    };
    const event = { notify };

    return insertBefore(settings, event).then(() => {
      const result = selectNodes("div#insertBefore .ib");

      expect(result[0].innerHTML).toEqual("BBB");
      expect(result[1].innerHTML).toEqual("AAA");
      expect(notify).toHaveBeenCalled();
    });
  });
});
