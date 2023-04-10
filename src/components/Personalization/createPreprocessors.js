import { DOM_ACTION } from "./constants/schema";
import remapHeadOffers from "./dom-actions/remapHeadOffers";
import remapCustomCodeOffers from "./dom-actions/remapCustomCodeOffers";

export default () => {
  return {
    [DOM_ACTION]: [remapHeadOffers, remapCustomCodeOffers]
  };
};
