import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createPrependHtml from "../../../../../../src/components/Personalization/actions/prependHtml";

const cleanUp = () => {
  selectNodes("ul#prependHtml").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("prependHtml") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::prependHtml", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should prepend personalized content", () => {
    const collect = jasmine.createSpy();
    const prependHtml = createPrependHtml(collect);
    const content = `<li>3</li>`;
    const element = createNode(
      "ul",
      { id: "prependHtml" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: `<li>1</li><li>2</li>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#prependHtml" };

    prependHtml(settings, event);

    const result = selectNodes("ul#prependHtml li");

    expect(result.length).toEqual(3);
    expect(result[0].innerHTML).toEqual("1");
    expect(result[1].innerHTML).toEqual("2");
    expect(result[2].innerHTML).toEqual("3");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
