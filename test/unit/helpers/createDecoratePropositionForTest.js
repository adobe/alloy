import createClickStorage from "../../../src/components/Personalization/createClickStorage";
import createDecorateProposition from "../../../src/components/Personalization/handlers/createDecorateProposition";

export default ({
  propositionId = "propositionID",
  itemId = "itemId",
  trackingLabel = "trackingLabel",
  scopeType = "page",
  notification = {
    id: "notifyId",
    scope: "web://mywebsite.com",
    scopeDetails: { something: true }
  }
} = {}) => {
  const { storeClickMeta } = createClickStorage();
  return createDecorateProposition(
    propositionId,
    itemId,
    trackingLabel,
    scopeType,
    notification,
    storeClickMeta
  );
};
