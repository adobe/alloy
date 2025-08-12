
export default ({getLocationHint, getAssuranceValidationTokenParams, apiVersion, queryString}) => {
  return ({edgeBasePath, endpointDomain, request, datastreamId}) => {
    const params = request.getRequestParams();
    const locationHint = getLocationHint();
    const edgeBasePathWithLocationHint = locationHint
      ? `${edgeBasePath}/${locationHint}${request.getEdgeSubPath()}`
      : `${edgeBasePath}${request.getEdgeSubPath()}`;
    const configId = request.getDatastreamIdOverride() || datastreamId;
    params.requestId = request.getId();

    if (configId !== datastreamId) {
      request.getPayload().mergeMeta({
        sdkConfig: {
          datastream: {
            original: datastreamId,
          },
        },
      });
    }
    params.configId = configId;
    const stringifiedRequestParams = queryString.stringify({...params, ...getAssuranceValidationTokenParams()});

    return `https://${endpointDomain}/${edgeBasePathWithLocationHint}/${apiVersion}/${request.getAction()}?${stringifiedRequestParams}`;
  };
};
