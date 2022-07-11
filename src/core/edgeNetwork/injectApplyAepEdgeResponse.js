import { createCallbackAggregator, noop } from "../../utils";
import mergeLifecycleResponses from "./mergeLifecycleResponses";

export default ({ cookieTransfer, lifecycle, createResponse }) => {
  return ({
    request,
    responseHeaders,
    responseBody,
    runOnResponseCallbacks = noop
  }) => {
    const onResponseCallbackAggregator = createCallbackAggregator();
    onResponseCallbackAggregator.add(lifecycle.onResponse);
    onResponseCallbackAggregator.add(runOnResponseCallbacks);

    return lifecycle
      .onBeforeRequest({
        request,
        onResponse: onResponseCallbackAggregator.add,
        onRequestFailure: noop
      })
      .then(() => {
        const response = createResponse({
          content: responseBody,
          getHeader: key => responseHeaders[key]
        });

        // This will clobber any cookies set via HTTP from the server.  So care should be given to remove any state:store handles if that is not desirable
        cookieTransfer.responseToCookies(response);

        return onResponseCallbackAggregator
          .call({ response })
          .then(mergeLifecycleResponses);
      });
  };
};
