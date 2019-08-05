import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::insertAfter", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  afterEach(() => {
    cleanUpDomChanges("insertAfter");
  });

  it("should inser after personalized content", done => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { insertAfter } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "ia" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertAfter" }, {}, [child]);
    const elements = [child];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: `<div id="b" class="ia">BBB</div>`,
      meta
    };
    const event = { elements, prehidingSelector: "#a" };

    insertAfter(settings, event)
      .then(() => {
        const result = selectNodes("div#insertAfter .ia");

        expect(result[0].innerHTML).toEqual("AAA");
        expect(result[1].innerHTML).toEqual("BBB");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Should not fail");
        done();
      });
  });
});
