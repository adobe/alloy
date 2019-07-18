import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import createSetHtml from "../../../../../src/components/Personalization/actions/setHtml";

const cleanUp = () => {
  selectNodes("div#setHtml").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("setHtml") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setHtml = createSetHtml(collect);
    const element = createNode("div", { id: "setHtml" });
    element.textContent = "foo";

    appendNode(document.body, element);

    const settings = { content: "bar", meta: { a: 1 } };
    const event = { element, prehidingSelector: "#setHtml" };

    setHtml(settings, event);

    expect(element.textContent).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
