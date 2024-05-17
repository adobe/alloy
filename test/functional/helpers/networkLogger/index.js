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
  // media endpoints
  const playEndpoint = /va\/v1\/play/;
  const pauseEndpoint = /va\/v1\/pauseStart/;
  const pingEndpoint = /va\/v1\/ping/;
  const adBreakCompleteEndpoint = /va\/v1\/adBreakComplete/;
  const adBreakStartEndpoint = /va\/v1\/adBreakStart/;
  const adCompleteEndpoint = /va\/v1\/adComplete/;
  const adSkipEndpoint = /va\/v1\/adSkip/;
  const adStartEndpoint = /va\/v1\/adStart/;
  const bitrateChangeEndpoint = /va\/v1\/bitrateChange/;
  const bufferStartEndpoint = /va\/v1\/bufferStart/;
  const chapterCompleteEndpoint = /va\/v1\/chapterComplete/;
  const chapterSkipEndpoint = /va\/v1\/chapterSkip/;
  const chapterStartEndpoint = /va\/v1\/chapterStart/;
  const errorEndpoint = /va\/v1\/error/;
  const sessionCompleteEndpoint = /va\/v1\/sessionComplete/;
  const sessionEndEndpoint = /va\/v1\/sessionEnd/;
  const statesUpdateEndpoint = /va\/v1\/statesUpdate/;

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
  // media endpoint loggers
  const mediaPlayEndpointLogs = createRequestLogger(playEndpoint);
  const mediaPauseEndpointLogs = createRequestLogger(pauseEndpoint);
  const pingEndpointLogs = createRequestLogger(pingEndpoint);
  const adBreakCompleteEndpointLogs = createRequestLogger(
    adBreakCompleteEndpoint,
  );
  const adBreakStartEndpointLogs = createRequestLogger(adBreakStartEndpoint);
  const adCompleteEndpointLogs = createRequestLogger(adCompleteEndpoint);
  const adSkipEndpointLogs = createRequestLogger(adSkipEndpoint);
  const adStartEndpointLogs = createRequestLogger(adStartEndpoint);
  const bitrateChangeEndpointLogs = createRequestLogger(bitrateChangeEndpoint);
  const bufferStartEndpointLogs = createRequestLogger(bufferStartEndpoint);
  const chapterCompleteEndpointLogs = createRequestLogger(
    chapterCompleteEndpoint,
  );
  const chapterSkipEndpointLogs = createRequestLogger(chapterSkipEndpoint);
  const chapterStartEndpointLogs = createRequestLogger(chapterStartEndpoint);
  const errorEndpointLogs = createRequestLogger(errorEndpoint);
  const sessionCompleteEndpointLogs = createRequestLogger(
    sessionCompleteEndpoint,
  );
  const sessionEndEndpointLogs = createRequestLogger(sessionEndEndpoint);
  const statesUpdateEndpointLogs = createRequestLogger(statesUpdateEndpoint);

  const clearLogs = async () => {
    await edgeEndpointLogs.clear();
    await edgeCollectEndpointLogs.clear();
    await edgeInteractEndpointLogs.clear();
    await setConsentEndpointLogs.clear();
    await acquireEndpointLogs.clear();
    await targetDeliveryEndpointLogs.clear();
    await targetMboxJsonEndpointLogs.clear();
    await mediaPlayEndpointLogs.clear();
    await mediaPauseEndpointLogs.clear();
    await pingEndpointLogs.clear();
    await adBreakCompleteEndpointLogs.clear();
    await adBreakStartEndpointLogs.clear();
    await adCompleteEndpointLogs.clear();
    await adSkipEndpointLogs.clear();
    await adStartEndpointLogs.clear();
    await bitrateChangeEndpointLogs.clear();
    await bufferStartEndpointLogs.clear();
    await chapterCompleteEndpointLogs.clear();
    await chapterSkipEndpointLogs.clear();
    await chapterStartEndpointLogs.clear();
    await errorEndpointLogs.clear();
    await sessionCompleteEndpointLogs.clear();
    await sessionEndEndpointLogs.clear();
    await statesUpdateEndpointLogs.clear();
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
    mediaPlayEndpointLogs,
    mediaPauseEndpointLogs,
    pingEndpointLogs,
    adBreakCompleteEndpointLogs,
    adBreakStartEndpointLogs,
    adCompleteEndpointLogs,
    adSkipEndpointLogs,
    adStartEndpointLogs,
    bitrateChangeEndpointLogs,
    bufferStartEndpointLogs,
    chapterCompleteEndpointLogs,
    chapterSkipEndpointLogs,
    chapterStartEndpointLogs,
    errorEndpointLogs,
    sessionCompleteEndpointLogs,
    sessionEndEndpointLogs,
    statesUpdateEndpointLogs,
    clearLogs,
  };
};

export default createNetworkLogger;
