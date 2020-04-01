import { RequestLogger } from "testcafe";
import DemdexProxy from "./DemdexProxy";

const networkLoggerOptions = {
  logRequestHeaders: true,
  logRequestBody: true,
  logResponseBody: true,
  stringifyResponseBody: false,
  stringifyRequestBody: true,
  logResponseHeaders: true
};

const createRequestLogger = endpoint => {
  return RequestLogger(endpoint, networkLoggerOptions);
};

const createNetworkLogger = () => {
  const edgeEndpoint = /v1\/(interact|collect)\?configId=/;
  const edgeCollectEndpoint = /v1\/collect\?configId=/;
  const edgeInteractEndpoint = /v1\/interact\?configId=/;
  const setConsentEndpoint = /v1\/privacy\/set-consent\?configId=/;

  const demdexProd = /adobedc\.demdex/;
  const demdexProxy = new DemdexProxy(demdexProd, networkLoggerOptions);

  const edgeEndpointLogs = createRequestLogger(edgeEndpoint);
  const edgeCollectEndpointLogs = createRequestLogger(edgeCollectEndpoint);
  const edgeInteractEndpointLogs = createRequestLogger(edgeInteractEndpoint);
  const setConsentEndpointLogs = createRequestLogger(setConsentEndpoint);

  const clearLogs = async () => {
    await edgeEndpointLogs.clear();
    await edgeCollectEndpointLogs.clear();
    await edgeInteractEndpointLogs.clear();
    await setConsentEndpointLogs.clear();
  };

  return {
    edgeEndpointLogs,
    edgeCollectEndpointLogs,
    edgeInteractEndpointLogs,
    setConsentEndpointLogs,
    demdexProxy,
    clearLogs
  };
};

export default createNetworkLogger;
