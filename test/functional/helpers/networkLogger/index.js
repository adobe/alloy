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
  const edgeCollectEndpoint = /v1\/collect\?configId=/;
  const edgeInteractEndpoint = /v1\/interact\?configId=/;
  const setConsentEndpoint = /v1\/privacy\/set-consent\?configId=/;

  const gatewayEndpointLogs = createRequestLogger(gatewayEndpoint);
  const adobedcDemdexLogs = createRequestLogger(adobedcDemdex);
  const dpmEndpointLogs = createRequestLogger(dpmDemdex);
  const edgeEndpointLogs = createRequestLogger(edgeEndpoint);
  const edgeCollectEndpointLogs = createRequestLogger(edgeCollectEndpoint);
  const edgeInteractEndpointLogs = createRequestLogger(edgeInteractEndpoint);
  const setConsentEndpointLogs = createRequestLogger(setConsentEndpoint);

  const clearLogs = async () => {
    await gatewayEndpointLogs.clear();
    await adobedcDemdexLogs.clear();
    await dpmEndpointLogs.clear();
    await edgeEndpointLogs.clear();
    await edgeCollectEndpointLogs.clear();
    await edgeInteractEndpointLogs.clear();
    await setConsentEndpointLogs.clear();
  };

  return {
    gatewayEndpointLogs,
    adobedcDemdexLogs,
    dpmEndpointLogs,
    edgeEndpointLogs,
    edgeCollectEndpointLogs,
    edgeInteractEndpointLogs,
    setConsentEndpointLogs,
    clearLogs
  };
};

export default createNetworkLogger;
