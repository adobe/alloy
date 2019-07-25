import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createMove from "../../../../../../src/components/Personalization/actions/move";

const cleanUp = () => {
  selectNodes("div#move").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("move") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::move", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const move = createMove(collect);
    const element = createNode("div", { id: "move" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: { left: "100px", top: "100px" },
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#move" };

    move(settings, event);

    expect(elements[0].style.left).toEqual("100px");
    expect(elements[0].style.top).toEqual("100px");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
