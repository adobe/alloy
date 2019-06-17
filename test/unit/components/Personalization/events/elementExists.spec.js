import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import elementExists from "../../../../../src/components/Personalization/events/elementExists";

describe("Presonalization::events::elementExists", () => {
  beforeEach(() => {
    selectNodes("span").forEach(removeNode);
  });

  afterEach(() => {
    selectNodes("span").forEach(removeNode);
  });

  it("should fire event when element exists", done => {
    appendNode(document.body, createNode("span", { id: "foo" }));

    const settings = { selector: "#foo", prehidingSelector: "#foo" };
    const trigger = event => {
      const { element, prehidingSelector } = event;

      done();
      expect(prehidingSelector).toEqual("#foo");
      expect(element.id).toEqual("foo");
    };

    elementExists(settings, trigger);
  });
});
