import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setImageSource", () => {
  beforeEach(() => {
    cleanUpDomChanges("setImageSource");
  });

  afterEach(() => {
    cleanUpDomChanges("setImageSource");
  });

  it("should swap image", done => {
    const url = "http://foo.com/a.png";
    const collect = jasmine.createSpy();
    const modules = initRuleComponentModules(collect);
    const { setImageSource } = modules;
    const element = createNode("img", { id: "setImageSource", src: url });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = { content: "http://foo.com/b.png", meta };
    const event = { elements, prehidingSelector: "#setImageSource" };

    setImageSource(settings, event)
      .then(() => {
        expect(elements[0].getAttribute("src")).toEqual("http://foo.com/b.png");
        expect(collect).toHaveBeenCalledWith(meta);
        done();
      })
      .catch(() => {
        fail("Should not fail");
        done();
      });
  });
});
