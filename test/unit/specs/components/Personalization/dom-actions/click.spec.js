import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import { initDomActionsModules } from "../../../../../../src/components/Personalization/dom-actions";
import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom";
import createDecoratePropositionForTest from "../../../../helpers/createDecoratePropositionForTest";

describe("Personalization::actions::click", () => {
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("click-me");
    decorateProposition = createDecoratePropositionForTest();
  });

  afterEach(() => {
    cleanUpDomChanges("click-me");
  });

  it("should decorate the element with personalized content", async () => {
    const modules = initDomActionsModules();
    const { click } = modules;
    const element = createNode(
      "div",
      { id: "click-me" },
      { innerText: "click me" }
    );
    appendNode(document.body, element);

    const settings = {
      selector: "#click-me"
    };

    await click(settings, decorateProposition);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "trackingLabel"
    );
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });
});
