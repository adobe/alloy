import { appendNode, createNode } from "../../../../../../src/utils/dom";
import createSetHtml from "../../../../../../src/components/Personalization/actions/setHtml";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setHtml = createSetHtml(collect);
    const element = createNode("div", { id: "setHtml" });
    element.innerHTML = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: "bar", meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setHtml" };

    setHtml(settings, event);

    expect(elements[0].innerHTML).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
