
export default ({queryString}) => {
  return ({edgeDomain, request, datastreamId}) => {
    const params = request.getRequestParams();
    const configId = request.getDatastreamIdOverride() || datastreamId;
    params.requestId = request.getId();
    params.configId = configId;
    const stringifiedRequestParams = queryString.stringify({...params});

    return `https://${edgeDomain}${request.getEdgeSubPath()}/${request.getAction()}?${stringifiedRequestParams}`;
  };
};
