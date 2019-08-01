import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createInsertBefore from "../../../../../../src/components/Personalization/actions/insertBefore";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::insertBefore", () => {
  beforeEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  afterEach(() => {
    cleanUpDomChanges("insertBefore");
  });

  it("should inser before personalized content", () => {
    const collect = jasmine.createSpy();
    const insertBefore = createInsertBefore(collect);
    const child = createNode(
      "div",
      { id: "a", class: "ib" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertBefore" }, {}, [child]);
    const elements = [child];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: `<div id="b" class="ib">BBB</div>`,
      meta
    };
    const event = { elements, prehidingSelector: "#a" };

    insertBefore(settings, event);

    const result = selectNodes("div#insertBefore .ib");

    expect(result[0].innerHTML).toEqual("BBB");
    expect(result[1].innerHTML).toEqual("AAA");
    expect(collect).toHaveBeenCalledWith(meta);
  });
});
