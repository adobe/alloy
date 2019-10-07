import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::click", () => {
  beforeEach(() => {
    cleanUpDomChanges("click");
  });

  afterEach(() => {
    cleanUpDomChanges("click");
  });

  it("should set click tracking attribute", () => {
    const collect = jasmine.createSpy();
    const storage = jasmine.createSpyObj("storage", ["setItem"]);
    const modules = initRuleComponentModules(collect, storage);
    const { click } = modules;
    const element = createNode("div", { id: "click" });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#click",
      meta
    };

    return click(settings, storage).then(() => {
      const key = elements[0].getAttribute("data-alloy-key");

      expect(storage.setItem).toHaveBeenCalledWith(key, meta);
    });
  });
});
