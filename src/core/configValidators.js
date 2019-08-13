import {
  required,
  validDomain,
  eitherNilOrNonEmpty,
  boolean
} from "../utils/config-validators";

export default {
  propertyId: {
    validate: required
  },
  edgeDomain: {
    validate: validDomain,
    defaultValue: "alpha.konductor.adobedc.net"
  },
  prehidingId: {
    defaultValue: "alloy-prehiding"
  },
  prehidingStyle: {
    validate: eitherNilOrNonEmpty
  },
  authoringMode: {
    defaultValue: false,
    validate: boolean
  },
  // TODO: For debugging purposes only. Remove eventually.
  shouldStoreCollectedData: { defaultValue: 1 },
  device: { defaultValue: "Chrome-Mac" }
};
