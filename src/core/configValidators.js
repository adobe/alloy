import {
  required,
  validDomain,
  validPrehidingSelector
} from "../utils/config-validators";

export default {
  propertyID: {
    validate: required
  },
  edgeDomain: {
    validate: validDomain,
    defaultValue: "edgegateway.azurewebsites.net"
  },
  prehidingSelector: {
    validate: validPrehidingSelector
  },
  // TODO: For debugging purposes only. Remove eventually.
  shouldStoreCollectedData: { defaultValue: 1 },
  device: { defaultValue: "Chrome-Mac" }
};
