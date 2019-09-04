import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { initRuleComponentModules } from "../../../../../../src/components/Personalization/turbine";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { noop } from "../../../../../../src/utils";

describe("Personalization::actions::setImageSource", () => {
  beforeEach(() => {
    cleanUpDomChanges("setImageSource");
  });

  afterEach(() => {
    cleanUpDomChanges("setImageSource");
  });

  it("should swap image", () => {
    const url = "http://foo.com/a.png";
    const notify = jasmine.createSpy();
    const modules = initRuleComponentModules(noop);
    const { setImageSource } = modules;
    const element = createNode("img", { id: "setImageSource", src: url });
    const elements = [element];

    appendNode(document.body, element);

    const settings = {
      selector: "#setImageSource",
      prehidingSelector: "#setImageSource",
      content: "http://foo.com/b.png"
    };
    const event = { notify };

    return setImageSource(settings, event).then(() => {
      expect(elements[0].getAttribute("src")).toEqual("http://foo.com/b.png");
      expect(notify).toHaveBeenCalled();
    });
  });
});
