import { appendNode, createNode } from "../../../../../../src/utils/dom";
import createSetText from "../../../../../../src/components/Personalization/actions/setText";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setText", () => {
  beforeEach(() => {
    cleanUpDomChanges("setHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("setHtml");
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setText = createSetText(collect);
    const element = createNode("div", { id: "setText" });
    element.textContent = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: "bar", meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setText" };

    setText(settings, event);

    expect(elements[0].textContent).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
