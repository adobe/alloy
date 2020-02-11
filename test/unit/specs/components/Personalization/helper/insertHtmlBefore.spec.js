import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::insertBefore", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  afterEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  it("should insert before personalized content", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { insertBefore } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ib" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertBefore" }, {}, [child]);

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#a",
      prehidingSelector: "#a",
      content: `<div id="b" class="ib">BBB</div>`,
      meta
    };

    return insertBefore(settings).then(() => {
      const result = selectNodes("div#insertBefore .ib");

      expect(result[0].innerHTML).toEqual("BBB");
      expect(result[1].innerHTML).toEqual("AAA");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
