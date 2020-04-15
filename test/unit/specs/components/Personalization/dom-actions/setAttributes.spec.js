import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setAttribute", () => {
  beforeEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  afterEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  it("should set element attribute", () => {
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { setAttribute } = modules;
    const element = createNode("div", { id: "setAttribute" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setAttribute",
      prehidingSelector: "#setAttribute",
      content: { "data-test": "bar" },
      meta
    };

    return setAttribute(settings).then(() => {
      expect(elements[0].getAttribute("data-test")).toEqual("bar");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
