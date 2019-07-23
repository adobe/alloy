import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createSetAttribute from "../../../../../../src/components/Personalization/actions/setAttribute";

const cleanUp = () => {
  selectNodes("div#setAttribute").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("setAttribute") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::setAttribute", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setAttribute = createSetAttribute(collect);
    const element = createNode("div", { id: "setAttribute" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: { "data-test": "bar" }, meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setAttribute" };

    setAttribute(settings, event);

    expect(elements[0].getAttribute("data-test")).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
