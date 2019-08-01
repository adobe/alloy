import { appendNode, createNode } from "../../../../../../src/utils/dom";
import createMove from "../../../../../../src/components/Personalization/actions/move";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::move", () => {
  beforeEach(() => {
    cleanUpDomChanges("move");
  });

  afterEach(() => {
    cleanUpDomChanges("move");
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const move = createMove(collect);
    const element = createNode("div", { id: "move" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: { left: "100px", top: "100px" },
      meta
    };
    const event = { elements, prehidingSelector: "#move" };

    move(settings, event);

    expect(elements[0].style.left).toEqual("100px");
    expect(elements[0].style.top).toEqual("100px");
    expect(collect).toHaveBeenCalledWith(meta);
  });
});
