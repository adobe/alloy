import EDGE_CONFIG_ID from "./constants/edgeConfigId";
import edgeDomainThirdParty from "./constants/configParts/edgeDomainThirdParty";

const edgeBasePath = process.env.EDGE_BASE_PATH;

export default (orgId, configId = EDGE_CONFIG_ID) => {
  const config = {
    edgeConfigId: configId,
    orgId: orgId || "5BFE274A5F6980A50A495C08@AdobeOrg",
    // Default `edgeDomain` to 3rd party; override in specific test if needed.
    ...edgeDomainThirdParty
  };

  if (edgeBasePath) {
    config.edgeBasePath = edgeBasePath;
  }

  return config;
};
