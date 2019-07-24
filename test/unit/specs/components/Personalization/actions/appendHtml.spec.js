import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createAppendHtml from "../../../../../../src/components/Personalization/actions/appendHtml";

const cleanUp = () => {
  selectNodes("ul#appendHtml").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("appendHtml") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::appendHtml", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should append personalized content", () => {
    const collect = jasmine.createSpy();
    const appendHtml = createAppendHtml(collect);
    const content = `<li>1</li>`;
    const element = createNode(
      "ul",
      { id: "appendHtml" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: `<li>2</li>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#appendHtml" };

    appendHtml(settings, event);

    const result = selectNodes("li");

    expect(result.length).toEqual(2);
    expect(result[0].innerHTML).toEqual("1");
    expect(result[1].innerHTML).toEqual("2");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
