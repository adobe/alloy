import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::rearrange", () => {
  beforeEach(() => {
    cleanUpDomChanges("rearrange");
  });

  afterEach(() => {
    cleanUpDomChanges("rearrange");
  });

  it("should rearrange elements when from < to", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { rearrange } = modules;
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const settings = {
      selector: "#rearrange",
      prehidingSelector: "#rearrange",
      content: { from: 0, to: 2 }
    };
    const event = { notify };

    return rearrange(settings, event).then(() => {
      const result = selectNodes("li");

      expect(result[0].textContent).toEqual("2");
      expect(result[1].textContent).toEqual("3");
      expect(result[2].textContent).toEqual("1");
      expect(notify).toHaveBeenCalled();
    });
  });

  it("should rearrange elements when from > to", () => {
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { rearrange } = modules;
    const content = `
      <li>1</li>
      <li>2</li>
      <li>3</li>
    `;
    const element = createNode(
      "ul",
      { id: "rearrange" },
      { innerHTML: content }
    );

    appendNode(document.body, element);

    const settings = {
      selector: "#rearrange",
      prehidingSelector: "#rearrange",
      content: { from: 2, to: 0 }
    };
    const event = { notify };

    return rearrange(settings, event).then(() => {
      const result = selectNodes("li");

      expect(result[0].textContent).toEqual("3");
      expect(result[1].textContent).toEqual("1");
      expect(result[2].textContent).toEqual("2");
      expect(notify).toHaveBeenCalled();
    });
  });
});
