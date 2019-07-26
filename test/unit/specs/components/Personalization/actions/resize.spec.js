import { appendNode, createNode } from "../../../../../../src/utils/dom";
import createResize from "../../../../../../src/components/Personalization/actions/resize";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::resize", () => {
  beforeEach(() => {
    cleanUpDomChanges("resize");
  });

  afterEach(() => {
    cleanUpDomChanges("resize");
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const resize = createResize(collect);
    const element = createNode("div", { id: "resize" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      content: { width: "100px", height: "100px" },
      meta: { a: 1 }
    };
    const event = { elements, prehidingSelector: "#resize" };

    resize(settings, event);

    expect(elements[0].style.width).toEqual("100px");
    expect(elements[0].style.height).toEqual("100px");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
