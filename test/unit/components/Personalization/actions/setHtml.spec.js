import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import createSetHtml from "../../../../../src/components/Personalization/actions/setHtml";

describe("Presonalization::actions::setHtml", () => {
  beforeEach(() => {
    selectNodes("div").forEach(removeNode);
  });

  afterEach(() => {
    selectNodes("div").forEach(removeNode);
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setHtml = createSetHtml(collect);
    const element = createNode("div", { id: "foo" });
    element.innerText = "foo";

    appendNode(document.body, element);

    const settings = { content: "bar", meta: { a: 1 } };
    const event = { element, prehidingSelector: "#foo" };

    setHtml(settings, event);

    expect(element.innerText).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
