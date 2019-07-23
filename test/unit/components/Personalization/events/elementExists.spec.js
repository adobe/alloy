import {
  selectNodes,
  removeNode,
  appendNode,
  createNode
} from "../../../../../src/utils/dom";
import elementExists from "../../../../../src/components/Personalization/events/elementExists";

const cleanUp = () => {
  selectNodes("span#elementExists").forEach(removeNode);
  selectNodes("style").forEach(node => {
    if (node.textContent.indexOf("elementExists") !== -1) {
      removeNode(node);
    }
  });
};

describe("Personalization::events::elementExists", () => {
  beforeEach(() => {
    cleanUp();
  });

  afterEach(() => {
    cleanUp();
  });

  it("should fire event when element exists", done => {
    appendNode(document.body, createNode("span", { id: "elementExists" }));

    const settings = {
      selector: "#elementExists",
      prehidingSelector: "#elementExists"
    };
    const trigger = event => {
      const { elements, prehidingSelector } = event;

      done();
      expect(prehidingSelector).toEqual("#elementExists");
      expect(elements[0].id).toEqual("elementExists");
    };

    elementExists(settings, trigger);
  });
});
