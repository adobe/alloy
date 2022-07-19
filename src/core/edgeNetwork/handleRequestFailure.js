export default onRequestFailureCallbackAggregator => {
  return error => {
    // Regardless of whether the network call failed, an unexpected status
    // code was returned, or the response body was malformed, we want to call
    // the onRequestFailure callbacks, but still throw the exception.
    const throwError = () => {
      throw error;
    };
    return onRequestFailureCallbackAggregator
      .call({ error })
      .then(throwError, throwError);
  };
};
