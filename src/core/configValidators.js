import {
  required,
  validDomain,
  eitherNilOrNonEmpty
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
    validate: eitherNilOrNonEmpty
  },
  // TODO: For debugging purposes only. Remove eventually.
  shouldStoreCollectedData: { defaultValue: 1 },
  device: { defaultValue: "Chrome-Mac" }
};
