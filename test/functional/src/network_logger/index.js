import { t, RequestLogger } from "testcafe";

const createRequestLogger = endpoint => {
  return RequestLogger(endpoint, {
    logRequestHeaders: true,
    logRequestBody: true,
    stringifyRequestBody: true,
    logResponseBody: true,
    stringifyResponseBody: true,
    logResponseHeaders: true
  });
};

const createNetworkLogger = () => {
  const gatewayEnpoint = /edgegateway\.azurewebsites/;
  const sandboxEndpoint = /alloyqe\.azurewebsites/;

  const gatewayEnpointLogs = createRequestLogger(gatewayEnpoint);
  const sandboxEndpointLogs = createRequestLogger(sandboxEndpoint);

  const clearLogs = async () => {
    await gatewayEnpointLogs.clear();
    await sandboxEndpointLogs.clear();
  };

  // TODO: Clean up and rename few things.
  const parseEvents = async (gatewayRequests, sandboxRequests) => {
    await t.wait(1000);
    const events = {};

    if (gatewayRequests.length !== 0) {
      events.trackPageData = [];
      await gatewayRequests.forEach(req => {
        const data = req.request.body;
        events.trackPageData.push(data);
      });
    }

    if (sandboxRequests.length !== 0) {
      events.trackClickData = [];
      await sandboxRequests.forEach(req => {
        const data = req.request.body;
        events.trackClickData.push(data);
      });
    }

    return events;
  };

  return {
    gatewayEnpointLogs,
    sandboxEndpointLogs,
    clearLogs,
    parseEvents
  };
};

export default createNetworkLogger;
