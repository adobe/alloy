import { RequestLogger } from "testcafe";

const createRequestLogger = endpoint => {
  return RequestLogger(endpoint, {
    logRequestHeaders: true,
    logRequestBody: true,
    logResponseBody: true,
    stringifyResponseBody: false,
    stringifyRequestBody: true,
    logResponseHeaders: true
  });
};

const createNetworkLogger = () => {
  const gatewayEndpoint = /konductor\.adobedc/;
  const sandboxEndpoint = /alloyqe\.azurewebsites/;
  const adobedcDemdex = /adobedc\.demdex/;
  const dpmDemdex = /dpm\.demdex/;

  const gatewayEndpointLogs = createRequestLogger(gatewayEndpoint, {
    logRequestBody: true
  });
  const sandboxEndpointLogs = createRequestLogger(sandboxEndpoint);
  const adobedcEndpointLogs = createRequestLogger(adobedcDemdex);
  const dpmEndpointLogs = createRequestLogger(dpmDemdex);

  const clearLogs = async () => {
    await gatewayEndpointLogs.clear();
    await sandboxEndpointLogs.clear();
    await adobedcEndpointLogs.clear();
    await dpmEndpointLogs.clear();
  };

  return {
    gatewayEndpointLogs,
    sandboxEndpointLogs,
    adobedcEndpointLogs,
    dpmEndpointLogs,
    clearLogs
  };
};

export default createNetworkLogger;
