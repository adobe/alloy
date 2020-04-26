import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setStyle", () => {
  beforeEach(() => {
    cleanUpDomChanges("setStyle");
  });

  afterEach(() => {
    cleanUpDomChanges("setStyle");
  });

  it("should set styles", () => {
    const modules = initDomActionsModules();
    const { setStyle } = modules;
    const element = createNode("div", { id: "setStyle" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setStyle",
      prehidingSelector: "#setStyle",
      content: { "font-size": "33px", priority: "important" },
      meta
    };

    return setStyle(settings).then(() => {
      expect(elements[0].style.getPropertyValue("font-size")).toEqual("33px");
    });
  });
});
