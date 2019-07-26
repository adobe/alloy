import {
  selectNodes,
  appendNode,
  createNode
} from "../../../../../../src/utils/dom";
import createRemove from "../../../../../../src/components/Personalization/actions/remove";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Presonalization::actions::remove", () => {
  beforeEach(() => {
    cleanUpDomChanges("remove");
  });

  afterEach(() => {
    cleanUpDomChanges("remove");
  });

  it("should remove element", () => {
    const collect = jasmine.createSpy();
    const remove = createRemove(collect);
    const content = `<div id="child"></div>`;
    const element = createNode("div", { id: "remove" }, { innerHTML: content });
    const elements = [element];

    appendNode(document.body, element);

    const settings = { meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#remove" };

    remove(settings, event);

    const result = selectNodes("#child");

    expect(result.length).toEqual(0);
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
