import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createInsertAfter from "../../../../../../src/components/Personalization/actions/insertAfter";

const cleanUp = () => {
  selectNodes("div#insertAfter").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("insertAfter") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::insertAfter", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should inser after personalized content", () => {
    const collect = jasmine.createSpy();
    const insertAfter = createInsertAfter(collect);
    const child = createNode(
      "div",
      { id: "a", class: "ia" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "insertAfter" }, {}, [child]);
    const elements = [child];

    appendNode(document.body, element);

    const settings = {
      content: `<div id="b" class="ia">BBB</div>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#a" };

    insertAfter(settings, event);

    const result = selectNodes("div#insertAfter .ia");

    expect(result[0].innerHTML).toEqual("AAA");
    expect(result[1].innerHTML).toEqual("BBB");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
