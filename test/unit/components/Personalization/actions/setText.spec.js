import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import createSetText from "../../../../../src/components/Personalization/actions/setText";

const cleanUp = () => {
  selectNodes("div#setText").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("setText") !== -1) {
      removeNode(node);
    }
  });
};

describe("Presonalization::actions::setText", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setText = createSetText(collect);
    const element = createNode("div", { id: "setText" });
    element.textContent = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: "bar", meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setText" };

    setText(settings, event);

    expect(elements[0].textContent).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
