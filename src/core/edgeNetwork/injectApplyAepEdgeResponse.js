import { createCallbackAggregator, noop } from "../../utils";
import mergeLifecycleResponses from "./mergeLifecycleResponses";
import handleRequestFailure from "./handleRequestFailure";

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

    return lifecycle
      .onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: onRequestFailureCallbackAggregator.add
      })
      .then(() =>
        createResponse({
          content: responseBody,
          getHeader: key => responseHeaders[key]
        })
      )
      .then(response => {
        processWarningsAndErrors(response);
        return response;
      })
      .catch(handleRequestFailure(onRequestFailureCallbackAggregator))
      .then(response => {
        // This will clobber any cookies set via HTTP from the server.  So care should be given to remove any state:store handles if that is not desirable
        cookieTransfer.responseToCookies(response);

        return onResponseCallbackAggregator
          .call({ response })
          .then(mergeLifecycleResponses);
      });
  };
};
