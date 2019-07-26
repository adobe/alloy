import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createAppendHtml from "../../../../../../src/components/Personalization/actions/appendHtml";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::appendHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("appendHtml");
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
      content: `<li>2</li><li>3</li>`,
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#appendHtml" };

    appendHtml(settings, event);

    const result = selectNodes("ul#appendHtml li");

    expect(result.length).toEqual(3);
    expect(result[0].innerHTML).toEqual("1");
    expect(result[1].innerHTML).toEqual("2");
    expect(result[2].innerHTML).toEqual("3");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
