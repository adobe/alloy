/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { RequestLogger } from "testcafe";

const networkLoggerOptions = {
  logRequestHeaders: true,
  logRequestBody: true,
  logResponseBody: true,
  stringifyResponseBody: false,
  stringifyRequestBody: true,
  logResponseHeaders: true,
};

const createRequestLogger = (endpoint) => {
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
    targetDeliveryEndpoint,
  );
  const targetMboxJsonEndpointLogs = createRequestLogger(
    targetMboxJsonEndpoint,
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
    clearLogs,
  };
};

export default createNetworkLogger;
