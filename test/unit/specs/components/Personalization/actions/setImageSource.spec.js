import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createSetImageSource from "../../../../../../src/components/Personalization/actions/setImageSource";

const cleanUp = () => {
  selectNodes("div#setImageSource").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("setImageSource") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::setImageSource", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should set personalized content", () => {
    const url = "http://foo.com/a.png";
    const collect = jasmine.createSpy();
    const setImageSource = createSetImageSource(collect);
    const element = createNode("img", { id: "setImageSource", src: url });
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: "http://foo.com/b.png", meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setImageSource" };

    setImageSource(settings, event);

    expect(elements[0].getAttribute("src")).toEqual("http://foo.com/b.png");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
