import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setText", () => {
  beforeEach(() => {
    cleanUpDomChanges("setText");
  });

  afterEach(() => {
    cleanUpDomChanges("setText");
  });

  it("should set personalized text", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { setText } = modules;
    const element = createNode("div", { id: "setText" });
    element.textContent = "foo";
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setText",
      prehidingSelector: "#setText",
      content: "bar",
      meta
    };

    return setText(settings).then(() => {
      expect(elements[0].textContent).toEqual("bar");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
