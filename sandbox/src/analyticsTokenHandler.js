export function getAnalyticsToken(proposition) {
  const { scopeDetails = {} } = proposition;
  const { characteristics = {} } = scopeDetails;
  const { analyticsToken } = characteristics;

  if (analyticsToken === undefined) {
    return;
  }
  return analyticsToken;
}

export const concatenateAnalyticsPayloads = analyticsPayloads => {
  if (analyticsPayloads.size > 1) {
    return [...analyticsPayloads].join(",");
  }
  return [...analyticsPayloads].join();
};

export const collectAnalyticsPayloadData = propositions => {
  const analyticsPayloads = new Set();

  propositions.forEach(proposition => {
    const { renderAttempted = false } = proposition;

    if (renderAttempted !== true) {
      return;
    }

    const analyticsPayload = getAnalyticsToken(proposition);

    if (analyticsPayload === undefined) {
      return;
    }

    analyticsPayloads.add(analyticsPayload);
  });

  return concatenateAnalyticsPayloads(analyticsPayloads);
};

export const getECID = instanceName => {
  return window[instanceName]("getIdentity", { namespaces: ["ECID"] }).then(
    result => {
      return result.identity.ECID;
    }
  );
};
