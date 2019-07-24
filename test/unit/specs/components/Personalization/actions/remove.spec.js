import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createRemove from "../../../../../../src/components/Personalization/actions/remove";

const cleanUp = () => {
  selectNodes("div#remove").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("remove") !== -1) {
      removeNode(node);
    }
  });
};

describe("Presonalization::actions::remove", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should remove element", () => {
    const collect = jasmine.createSpy();
    const remove = createRemove(collect);
    const content = `<div id="child"></div>`;
    const element = createNode("div", { id: "remove" }, { innerHTML: content });
    const elements = [element];

    appendNode(document.body, element);

    const settings = { meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#remove" };

    remove(settings, event);

    const result = selectNodes("#child");

    expect(result.length).toEqual(0);
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
