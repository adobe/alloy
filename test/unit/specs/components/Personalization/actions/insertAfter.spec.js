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
    const content = `<div id="a" class="test">AAA</div>`;
    const element = createNode(
      "div",
      { id: "insertAfter" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: `<div id="b" class="test">BBB</div>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#a" };

    insertAfter(settings, event);

    const result = selectNodes(".test");

    expect(result[0].innerHTML).toEqual("AAA");
    expect(result[1].innerHTML).toEqual("BBB");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
