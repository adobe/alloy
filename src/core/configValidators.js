import { required, validDomain } from "../utils/config-validators";

export default {
  propertyID: { validate: required },
  collectionDomain: {
    validate: validDomain,
    defaultValue: "edgegateway.azurewebsites.net"
  },
  // TODO: For debugging purposes only. Remove eventually.
  shouldStoreCollectedData: { defaultValue: 1 },
  device: { defaultValue: "Chrome-Mac" }
};
