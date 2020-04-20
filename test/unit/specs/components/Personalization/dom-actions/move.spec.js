import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::move", () => {
  beforeEach(() => {
    cleanUpDomChanges("move");
  });

  afterEach(() => {
    cleanUpDomChanges("move");
  });

  it("should move personalized content", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { move } = modules;
    const element = createNode("div", { id: "move" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#move",
      prehidingSelector: "#move",
      content: { left: "100px", top: "100px" },
      meta
    };

    move(settings).then(() => {
      expect(elements[0].style.left).toEqual("100px");
      expect(elements[0].style.top).toEqual("100px");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
