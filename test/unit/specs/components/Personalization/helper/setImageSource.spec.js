import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";

describe("Personalization::actions::setImageSource", () => {
  beforeEach(() => {
    cleanUpDomChanges("setImageSource");
  });

  afterEach(() => {
    cleanUpDomChanges("setImageSource");
  });

  it("should swap image", () => {
    const url = "http://foo.com/a.png";
    const collect = jasmine.createSpy();
    const modules = initDomActionsModules(collect);
    const { setImageSource } = modules;
    const element = createNode("img", { id: "setImageSource", src: url });
    const elements = [element];

    appendNode(document.body, element);

    const meta = { a: 1 };
    const settings = {
      selector: "#setImageSource",
      prehidingSelector: "#setImageSource",
      content: "http://foo.com/b.png",
      meta
    };

    return setImageSource(settings).then(() => {
      expect(elements[0].getAttribute("src")).toEqual("http://foo.com/b.png");
      expect(collect).toHaveBeenCalledWith(meta);
    });
  });
});
