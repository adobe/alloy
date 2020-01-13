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
  const gatewayEndpoint = /edge\.adobedc/;
  const adobedcDemdex = /adobedc\.demdex/;
  const dpmDemdex = /dpm\.demdex/;
  const edgeEndpoint = /v1\/(interact|collect)\?configId=/;

  const gatewayEndpointLogs = createRequestLogger(gatewayEndpoint);
  const adobedcDemdexLogs = createRequestLogger(adobedcDemdex);
  const dpmEndpointLogs = createRequestLogger(dpmDemdex);
  const edgeEndpointLogs = createRequestLogger(edgeEndpoint);

  const clearLogs = async () => {
    await gatewayEndpointLogs.clear();
    await adobedcDemdexLogs.clear();
    await dpmEndpointLogs.clear();
    await edgeEndpointLogs.clear();
  };

  return {
    gatewayEndpointLogs,
    adobedcDemdexLogs,
    dpmEndpointLogs,
    edgeEndpointLogs,
    clearLogs
  };
};

export default createNetworkLogger;
