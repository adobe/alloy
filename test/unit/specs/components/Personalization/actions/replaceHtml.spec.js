import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::replaceHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("replaceHtml");
  });

  it("should replace element with personalized content", () => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { replaceHtml } = modules;
    const child = createNode(
      "div",
      { id: "a", class: "rh" },
      { innerHTML: "AAA" }
    );
    const element = createNode("div", { id: "replaceHtml" }, {}, [child]);
    const elements = [child];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: `<div id="b" class="rh">BBB</div>`,
      meta
    };
    const event = { elements, prehidingSelector: "#a" };

    replaceHtml(settings, event);

    const result = selectNodes("div#replaceHtml .rh");

    expect(result.length).toEqual(1);
    expect(result[0].innerHTML).toEqual("BBB");
    expect(collect).toHaveBeenCalledWith(meta);
  });
});
