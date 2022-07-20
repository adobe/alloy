import { createCallbackAggregator, noop } from "../../utils";
import mergeLifecycleResponses from "./mergeLifecycleResponses";
import handleRequestFailure from "./handleRequestFailure";

const HTTP_STATUS_OK = 200;

export default ({
  cookieTransfer,
  lifecycle,
  createResponse,
  processWarningsAndErrors
}) => {
  return ({
    request,
    responseHeaders,
    responseBody,
    runOnResponseCallbacks = noop,
    runOnRequestFailureCallbacks = noop
  }) => {
    const onResponseCallbackAggregator = createCallbackAggregator();
    onResponseCallbackAggregator.add(lifecycle.onResponse);
    onResponseCallbackAggregator.add(runOnResponseCallbacks);

    const onRequestFailureCallbackAggregator = createCallbackAggregator();
    onRequestFailureCallbackAggregator.add(lifecycle.onRequestFailure);
    onRequestFailureCallbackAggregator.add(runOnRequestFailureCallbacks);

    const getHeader = key => responseHeaders[key];

    return lifecycle
      .onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add
      })
      .then(() =>
        processWarningsAndErrors({
          statusCode: HTTP_STATUS_OK,
          getHeader,
          body: JSON.stringify(responseBody),
          parsedBody: responseBody
        })
      )
      .catch(handleRequestFailure(onRequestFailureCallbackAggregator))
      .then(() => {
        const response = createResponse({
          content: responseBody,
          getHeader
        });

        // This will clobber any cookies set via HTTP from the server.  So care should be given to remove any state:store handles if that is not desirable
        cookieTransfer.responseToCookies(response);

        return onResponseCallbackAggregator
          .call({ response })
          .then(mergeLifecycleResponses);
      });
  };
};
