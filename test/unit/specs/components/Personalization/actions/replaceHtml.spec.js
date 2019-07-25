import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createReplaceHtml from "../../../../../../src/components/Personalization/actions/replaceHtml";

const cleanUp = () => {
  selectNodes("div#replaceHtml").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("replaceHtml") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::actions::replaceHtml", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should replace element with personalized content", () => {
    const collect = jasmine.createSpy();
    const replaceHtml = createReplaceHtml(collect);
    const child = createNode(
      "div",
      { id: "a", class: "rh" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "replaceHtml" }, {}, [child]);
    const elements = [child];

    appendNode(document.body, element);

    const settings = {
      content: `<div id="b" class="rh">BBB</div>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#a" };

    replaceHtml(settings, event);

    const result = selectNodes("div#replaceHtml .rh");

    expect(result.length).toEqual(1);
    expect(result[0].innerHTML).toEqual("BBB");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
