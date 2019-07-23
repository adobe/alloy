import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createResize from "../../../../../../src/components/Personalization/actions/resize";

const cleanUp = () => {
  selectNodes("div#resize").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("resize") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::resize", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const resize = createResize(collect);
    const element = createNode("div", { id: "resize" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: { width: "100px", height: "100px" },
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#resize" };

    resize(settings, event);

    expect(elements[0].style.width).toEqual("100px");
    expect(elements[0].style.height).toEqual("100px");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
