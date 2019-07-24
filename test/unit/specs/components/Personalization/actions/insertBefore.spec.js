import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createInsertBefore from "../../../../../../src/components/Personalization/actions/insertBefore";

const cleanUp = () => {
  selectNodes("div#insertBefore").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("insertBefore") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::insertBefore", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should inser before personalized content", () => {
    const collect = jasmine.createSpy();
    const insertBefore = createInsertBefore(collect);
    const content = `<div id="a" class="test">AAA</div>`;
    const element = createNode(
      "div",
      { id: "insertBefore" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: `<div id="b" class="test">BBB</div>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#a" };

    insertBefore(settings, event);

    const result = selectNodes(".test");

    expect(result[0].innerHTML).toEqual("BBB");
    expect(result[1].innerHTML).toEqual("AAA");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
