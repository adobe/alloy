import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::appendHtml", () => {
  beforeEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  afterEach(() => {
    cleanUpDomChanges("appendHtml");
  });

  it("should append personalized content", done => {
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { appendHtml } = modules;
    const content = `<li>1</li>`;
    const element = createNode(
      "ul",
      { id: "appendHtml" },
      { innerHTML: content }
    );
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      content: `<li>2</li><li>3</li>`,
      meta
    };
    const event = { elements, prehidingSelector: "#appendHtml" };

    appendHtml(settings, event)
      .then(() => {
        const result = selectNodes("ul#appendHtml li");

        expect(result.length).toEqual(3);
        expect(result[0].innerHTML).toEqual("1");
        expect(result[1].innerHTML).toEqual("2");
        expect(result[2].innerHTML).toEqual("3");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Shoudl not fail");
        done();
      });
  });
});
