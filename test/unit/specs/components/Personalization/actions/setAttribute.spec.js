import { appendNode, createNode } from "../../../../../../src/utils/dom";
import createSetAttribute from "../../../../../../src/components/Personalization/actions/setAttribute";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setAttribute", () => {
  beforeEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  afterEach(() => {
    cleanUpDomChanges("setAttribute");
  });

  it("should set personalized content", () => {
    const collect = jasmine.createSpy();
    const setAttribute = createSetAttribute(collect);
    const element = createNode("div", { id: "setAttribute" });
    const elements = [element];

    appendNode(document.body, element);

    const settings = { content: { "data-test": "bar" }, meta: { a: 1 } };
    const event = { elements, prehidingSelector: "#setAttribute" };

    setAttribute(settings, event);

    expect(elements[0].getAttribute("data-test")).toEqual("bar");
    expect(collect).toHaveBeenCalledWith({
      meta: { personalization: { a: 1 } }
    });
  });
});
