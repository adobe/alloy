import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import createRearrange from "../../../../../src/components/Personalization/actions/rearrange";

const cleanUp = () => {
  selectNodes("ul#rearrange").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("rearrange") !== -1) {
      removeNode(node);
    }
  });
};

describe("Presonalization::actions::rearrange", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should rearrange elements when from < to", () => {
    const collect = jasmine.createSpy();
    const rearrange = createRearrange(collect);
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: { from: 0, to: 2 }, meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#rearrange" };

    rearrange(settings, event);

    const result = selectNodes("li");

    expect(result[0].textContent).toEqual("2");
    expect(result[1].textContent).toEqual("3");
    expect(result[2].textContent).toEqual("1");

    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });

  it("should rearrange elements when from > to", () => {
    const collect = jasmine.createSpy();
    const rearrange = createRearrange(collect);
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: { from: 2, to: 0 }, meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#rearrange" };

    rearrange(settings, event);

    const result = selectNodes("li");

    expect(result[0].textContent).toEqual("3");
    expect(result[1].textContent).toEqual("1");
    expect(result[2].textContent).toEqual("2");

    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
