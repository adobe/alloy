import { RequestLogger } from "testcafe";

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
  const acquireEndpoint = /v1\/identity\/acquire\?configId=/;
  const targetDeliveryEndpoint = /rest\/v1\/delivery\?client=/;
  const targetMboxJsonEndpoint = /m2\/unifiedjsqeonly\/mbox\/json\?mbox=/;

  const edgeEndpointLogs = createRequestLogger(edgeEndpoint);
  const edgeCollectEndpointLogs = createRequestLogger(edgeCollectEndpoint);
  const edgeInteractEndpointLogs = createRequestLogger(edgeInteractEndpoint);
  const setConsentEndpointLogs = createRequestLogger(setConsentEndpoint);
  const acquireEndpointLogs = createRequestLogger(acquireEndpoint);
  const targetDeliveryEndpointLogs = createRequestLogger(
    targetDeliveryEndpoint
  );
  const targetMboxJsonEndpointLogs = createRequestLogger(
    targetMboxJsonEndpoint
  );

  const clearLogs = async () => {
    await edgeEndpointLogs.clear();
    await edgeCollectEndpointLogs.clear();
    await edgeInteractEndpointLogs.clear();
    await setConsentEndpointLogs.clear();
    await acquireEndpointLogs.clear();
    await targetDeliveryEndpointLogs.clear();
    await targetMboxJsonEndpointLogs.clear();
  };

  return {
    edgeEndpointLogs,
    // Before using edgeCollectEndpointLogs in a test, check to see if you
    // should be using the createCollectEndpointAssertion.js module instead.
    edgeCollectEndpointLogs,
    edgeInteractEndpointLogs,
    setConsentEndpointLogs,
    acquireEndpointLogs,
    targetDeliveryEndpointLogs,
    targetMboxJsonEndpointLogs,
    clearLogs
  };
};

export default createNetworkLogger;
