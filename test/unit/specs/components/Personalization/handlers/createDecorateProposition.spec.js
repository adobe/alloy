import createDecorateProposition, {
  CLICK_LABEL_DATA_ATTRIBUTE,
  INTERACT_ID_DATA_ATTRIBUTE
} from "../../../../../../src/components/Personalization/handlers/createDecorateProposition";
import cleanUpDomChanges from "../../../../helpers/cleanUpDomChanges";
import { appendNode, createNode } from "../../../../../../src/utils/dom";
import { getAttribute } from "../../../../../../src/components/Personalization/dom-actions/dom";
import createClickStorage from "../../../../../../src/components/Personalization/createClickStorage";

describe("Personalization::createDecorateProposition", () => {
  let storeClickMeta;
  let decorateProposition;

  beforeEach(() => {
    cleanUpDomChanges("something");
    ({ storeClickMeta } = createClickStorage());
  });

  afterEach(() => {
    cleanUpDomChanges("something");
  });

  it("sets a data-attribute for interact id and label", () => {
    decorateProposition = createDecorateProposition(
      "propId",
      "itemId",
      "myTrackingLabel",
      "page",
      {
        id: "notifyId",
        scope: "web://mywebsite.com",
        scopeDetails: { something: true }
      },
      storeClickMeta
    );

    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("does not set a data-attribute for label if no label is specified", () => {
    decorateProposition = createDecorateProposition(
      "propId",
      "itemId",
      undefined,
      "page",
      {
        id: "notifyId",
        scope: "web://mywebsite.com",
        scopeDetails: { something: true }
      },
      storeClickMeta
    );

    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toBeNull();
    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).not.toBeNull();
  });

  it("reuses interact ids when one is already present on an element", () => {
    const element = createNode(
      "div",
      { id: "something" },
      { innerText: "superfluous" }
    );
    appendNode(document.body, element);

    decorateProposition = createDecorateProposition(
      "propId",
      "itemId1",
      "myTrackingLabel",
      "page",
      {
        id: "notifyId1",
        scope: "web://mywebsite.com",
        scopeDetails: { something: true }
      },
      storeClickMeta
    );
    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );
    const interactId = getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE);
    expect(interactId).not.toBeNull();

    decorateProposition = createDecorateProposition(
      "propId",
      "itemId2",
      "myTrackingLabel",
      "page",
      {
        id: "notifyId2",
        scope: "web://mywebsite.com",
        scopeDetails: { something: true }
      },
      storeClickMeta
    );

    decorateProposition(element);

    expect(getAttribute(element, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
      "myTrackingLabel"
    );

    expect(getAttribute(element, INTERACT_ID_DATA_ATTRIBUTE)).toEqual(
      interactId
    );
  });

  it("provides a unique interact id for each element", () => {
    const element = createNode(
      "div",
      { id: "something" },
      {
        innerHTML:
          "<li class='one'>one</li><li class='two'>two</li><li class='three'>three</li>"
      }
    );
    appendNode(document.body, element);

    const interactIds = new Set();

    ["one", "two", "three"].forEach((value, idx) => {
      decorateProposition = createDecorateProposition(
        `propId_${value}`,
        `itemId_${idx}`,
        `trackingLabel${value}`,
        "page",
        {
          id: `notifyId${idx}`,
          scope: "web://mywebsite.com",
          scopeDetails: { something: true }
        },
        storeClickMeta
      );
      const li = document.querySelector(`#something .${value}`);
      decorateProposition(li);

      expect(getAttribute(li, CLICK_LABEL_DATA_ATTRIBUTE)).toEqual(
        `trackingLabel${value}`
      );
      const interactId = getAttribute(li, INTERACT_ID_DATA_ATTRIBUTE);
      expect(interactId).not.toBeNull();

      interactIds.add(interactId);
    });
    expect(interactIds.size).toEqual(3);
  });
});
