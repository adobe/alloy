import { edgeConfigId } from "../../edgeInfo";
import edgeDomainThirdParty from "./edgeDomainThirdParty";

// Default `edgeDomain` to 3rd party; override in specific test if needed.
export default {
  edgeConfigId,
  orgId: "334F60F35E1597910A495EC2@AdobeOrg",
  ...edgeDomainThirdParty
};
