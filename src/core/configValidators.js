import { required } from "./createConfig";

export default {
  propertyID: { validate: required },
  collectionUrl: {
    validate: (cfg, key, currentValue) => {
      if (!currentValue.match(/^https:\/\//gi)) {
        return `The collectionUrl must start with "https://". This url was specified "${currentValue}"`;
      }
      return undefined;
    },
    defaultValue: "https://edgegateway.azurewebsites.net"
  },
  // TODO: For debugging purposes only. Remove eventually.
  shouldStoreCollectedData: { defaultValue: 1 },
  device: { defaultValue: "Chrome-Mac" }
};
