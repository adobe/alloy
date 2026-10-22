/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import type { EdgeRequestExecutor } from "./types.js";
import type {
  Event,
  Response,
  ResponseContent,
  ResponseCreator,
} from "../types.js";
import type { NetworkResponse } from "../../services/types.js";
import type { Lifecycle } from "../createLifecycle.js";
import type { CookieTransfer } from "../createCookieTransfer.js";
import type { SendNetworkRequestOptions } from "../network/injectSendNetworkRequest.js";
import type { Request, RequestPayload } from "../../utils/request/types.js";
import type {
  EdgeCredentials,
  ImsAccessTokenProvider,
} from "./injectGetImsAccessToken.js";
import {
  ID_THIRD_PARTY as ID_THIRD_PARTY_DOMAIN,
  SERVER as SERVER_DOMAIN,
} from "../../constants/domain.js";
import apiVersion from "../../constants/apiVersion.js";
import { createCallbackAggregator, noop } from "../../utils/index.js";
import { isNetworkError } from "../../utils/networkErrors.js";
import clamp from "../../utils/clamp.js";
import mergeLifecycleResponses from "./mergeLifecycleResponses.js";
import handleRequestFailure from "./handleRequestFailure.js";

const MAX_QUEUE_TIME_MILLIS = 300000; // 5 minutes

/** The lifecycle hooks the Edge request factories call. */
export type EdgeNetworkLifecycle = Pick<
  Lifecycle,
  "onBeforeRequest" | "onResponse" | "onRequestFailure"
>;

export interface EdgeNetworkResponse extends NetworkResponse {
  parsedBody?: ResponseContent;
}

export interface InjectSendEdgeNetworkRequestOptions {
  config: {
    edgeDomain: string;
    edgeBasePath: string;
    datastreamId: string;
    orgId: string;
    edgeCredentials?: EdgeCredentials;
  };
  lifecycle: EdgeNetworkLifecycle;
  cookieTransfer: CookieTransfer;
  sendNetworkRequest: (
    options: SendNetworkRequestOptions,
  ) => Promise<EdgeNetworkResponse>;
  createResponse: ResponseCreator;
  processWarningsAndErrors: (networkResponse: EdgeNetworkResponse) => void;
  getLocationHint: () => string | undefined;
  getAssuranceValidationTokenParams: () => string;
  getImsAccessToken?: ImsAccessTokenProvider;
}

// Events added to a data collection payload are core Events.
type QueuedRequestPayload = {
  getEvents?: () => Pick<Event, "getCreatedAt">[];
};

const calculateQueueTimeMillis = (payload: QueuedRequestPayload) => {
  if (typeof payload.getEvents !== "function") {
    return undefined;
  }
  const events = payload.getEvents();
  if (events.length === 0) {
    return undefined;
  }

  // In practice, there should only be one event in the payload, in the future if this changes we'll need to
  // evaluate what timestamp to use (earliest, average, latest), or move the queueTime to the event meta
  const earliestCreatedAt = Math.min(
    ...events.map((event) => event.getCreatedAt()),
  );
  return clamp(Date.now() - earliestCreatedAt, 0, MAX_QUEUE_TIME_MILLIS);
};

const isDemdexBlockedError = (error: Error, request: Request) => {
  return request.getUseIdThirdPartyDomain() && isNetworkError(error);
};

// Confirmed against the real API: the Server API (v2) only exists for the
// interact action — privacy/set-consent and identity/acquire both 404
// under v2.
const isServerApiEligible = (request: Request) =>
  request.getAction() === "interact";

// v2 expects a singular `event` object rather than v1's `events` array,
// and requires an explicit primary identity in it (no browser cookie to
// resolve identity from) — confirmed by testing against the real
// endpoint; not documented anywhere we could find.
const toServerApiPayloadJSON = (payload: RequestPayload) => {
  // toJSON() is typed as object; a data collection payload's JSON has an events array.
  const { events, ...rest } = payload.toJSON() as { events?: unknown[] };
  if (!events || events.length !== 1) {
    throw new Error(
      `The authenticated Server API (v2) only supports exactly one event per request; got ${events ? events.length : 0}.`,
    );
  }
  return { ...rest, event: events[0] };
};

/**
 * Returns a function that sends edge network requests with lifecycle management.
 */
export default ({
  config,
  lifecycle,
  cookieTransfer,
  sendNetworkRequest,
  createResponse,
  processWarningsAndErrors,
  getLocationHint,
  getAssuranceValidationTokenParams,
  getImsAccessToken,
}: InjectSendEdgeNetworkRequestOptions): EdgeRequestExecutor => {
  const { edgeDomain, edgeBasePath, datastreamId, orgId, edgeCredentials } =
    config;
  let hasDemdexFailed = false;

  // v2 differs from v1 in domain, version segment, and datastream query
  // param name — not just an extra header.
  const buildEndpointUrl = (
    endpointDomain: string,
    request: Request,
    useServerApi?: boolean,
  ) => {
    // The cluster location hint is a browser/v1 CDN-routing artifact —
    // confirmed against the real API that the Server API domain 404s if
    // it's included, even though a v1 response can still write the cookie.
    const locationHint = useServerApi ? undefined : getLocationHint();
    const edgeBasePathWithLocationHint = locationHint
      ? `${edgeBasePath}/${locationHint}${request.getEdgeSubPath()}`
      : `${edgeBasePath}${request.getEdgeSubPath()}`;
    const resolvedDatastreamId =
      request.getDatastreamIdOverride() || datastreamId;

    if (resolvedDatastreamId !== datastreamId) {
      request.getPayload().mergeMeta({
        sdkConfig: {
          datastream: {
            original: datastreamId,
          },
        },
      });
    }

    const version = useServerApi ? "v2" : apiVersion;
    const datastreamParamName = useServerApi ? "dataStreamId" : "configId";

    return `https://${endpointDomain}/${edgeBasePathWithLocationHint}/${version}/${request.getAction()}?${datastreamParamName}=${resolvedDatastreamId}&requestId=${request.getId()}${getAssuranceValidationTokenParams()}`;
  };

  const buildAuthHeaders = async () => {
    // Only called when useServerApi is true, which requires edgeCredentials;
    // core/index.js supplies getImsAccessToken whenever edgeCredentials is set.
    const accessToken = await getImsAccessToken!.getAccessToken();
    return {
      Authorization: `Bearer ${accessToken}`,
      "x-api-key": edgeCredentials!.clientId,
      "x-gw-ims-org-id": orgId,
    };
  };

  /**
   * Sends a network request that is aware of payload interfaces,
   * lifecycle methods, configured edge domains, response structures, etc.
   */
  return ({
    request,
    runOnResponseCallbacks = noop,
    runOnRequestFailureCallbacks = noop,
  }) => {
    const onResponseCallbackAggregator =
      createCallbackAggregator<[{ response: Response }]>();
    onResponseCallbackAggregator.add(lifecycle.onResponse);
    onResponseCallbackAggregator.add(runOnResponseCallbacks);

    const onRequestFailureCallbackAggregator =
      createCallbackAggregator<[{ error: unknown }]>();
    onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
    onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);

    const useServerApi = !!edgeCredentials && isServerApiEligible(request);

    return lifecycle
      .onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add,
      })
      .then(async () => {
        // The demdex third-party-domain dance is a browser ITP/ad-blocker
        // workaround, not applicable to authenticated server-to-server
        // calls — those always go to the Server API domain instead.
        const endpointDomain = useServerApi
          ? SERVER_DOMAIN
          : hasDemdexFailed || !request.getUseIdThirdPartyDomain()
            ? edgeDomain
            : ID_THIRD_PARTY_DOMAIN;

        const url = buildEndpointUrl(endpointDomain, request, useServerApi);
        const payload = request.getPayload();

        const queueTimeMillis = calculateQueueTimeMillis(
          // Only data collection payloads have getEvents; the helper checks for it.
          payload as QueuedRequestPayload,
        );
        if (queueTimeMillis !== undefined) {
          payload.mergeMeta({ queueTimeMillis });
        }

        cookieTransfer.cookiesToPayload(payload, endpointDomain);

        const headers = useServerApi ? await buildAuthHeaders() : undefined;
        const outgoingPayload = useServerApi
          ? toServerApiPayloadJSON(payload)
          : payload;

        return sendNetworkRequest({
          requestId: request.getId(),
          url,
          payload: outgoingPayload,
          useSendBeacon: request.getUseSendBeacon(),
          useKeepalive: request.getUseKeepalive(),
          headers,
        });
      })
      .then((networkResponse) => {
        processWarningsAndErrors(networkResponse);
        return networkResponse;
      })
      .catch(async (error: Error) => {
        if (!useServerApi && isDemdexBlockedError(error, request)) {
          hasDemdexFailed = true;
          request.setUseIdThirdPartyDomain(false);
          const url = buildEndpointUrl(edgeDomain, request);
          const payload = request.getPayload();
          cookieTransfer.cookiesToPayload(payload, edgeDomain);

          return sendNetworkRequest({
            requestId: request.getId(),
            url,
            payload,
            useSendBeacon: request.getUseSendBeacon(),
            useKeepalive: request.getUseKeepalive(),
          });
        }
        return handleRequestFailure(onRequestFailureCallbackAggregator)(error);
      })
      .then(({ parsedBody, getHeader }) => {
        // Note that networkResponse.parsedBody may be undefined if it was a
        // 204 No Content response. That's fine.
        const response = createResponse({ content: parsedBody, getHeader });
        cookieTransfer.responseToCookies(response);

        // Notice we're calling the onResponse lifecycle method even if there are errors
        // inside the response body. This is because the full request didn't actually fail--
        // only portions of it that are considered non-fatal (a specific, non-critical
        // Konductor plugin, for example).
        return onResponseCallbackAggregator
          .call({
            response,
          })
          .then(mergeLifecycleResponses);
      });
  };
};
