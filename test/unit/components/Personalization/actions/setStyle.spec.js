import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import createSetStyle from "../../../../../src/components/Personalization/actions/setStyle";

const cleanUp = () => {
  selectNodes("div#setStyle").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("setStyle") !== -1) {
      removeNode(node);
    }
  });
};

describe("Presonalization::actions::setStyle", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setStyle = createSetStyle(collect);
    const element = createNode("div", { id: "setStyle" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: { "font-weight": "100" }, meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setStyle" };

    setStyle(settings, event);

    const result = window.getComputedStyle(element, null);

    expect(result.getPropertyValue("font-weight")).toEqual("100");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
