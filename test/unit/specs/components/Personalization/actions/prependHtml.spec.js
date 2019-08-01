import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createPrependHtml from "../../../../../../src/components/Personalization/actions/prependHtml";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::prependHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("prependHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("prependHtml");
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

    const meta = { a: 1 };
    const settings = {
      content: `<li>1</li><li>2</li>`,
      meta
    };
    const event = { elements, prehidingSelector: "#prependHtml" };

    prependHtml(settings, event);

    const result = selectNodes("ul#prependHtml li");

    expect(result.length).toEqual(3);
    expect(result[0].innerHTML).toEqual("1");
    expect(result[1].innerHTML).toEqual("2");
    expect(result[2].innerHTML).toEqual("3");
    expect(collect).toHaveBeenCalledWith(meta);
  });
});
