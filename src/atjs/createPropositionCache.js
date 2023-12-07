export default () => {
  const propositionCache = {};

  const cacheKey = (scope, eventToken) => `${scope}-${eventToken}`;

  const storePropositions = aepResponse => {
    const { propositions = [] } = aepResponse;

    propositions.forEach(proposition => {
      const { scope, scopeDetails = {} } = proposition;
      const { characteristics = {} } = scopeDetails;
      const { eventToken } = characteristics;

      if (scope && eventToken) {
        propositionCache[cacheKey(scope, eventToken)] = proposition;
      }
    });

    return aepResponse;
  };

  const getProposition = (scope, eventToken) => {
    return propositionCache[cacheKey(scope, eventToken)];
  };

  return {
    storePropositions,
    getProposition
  };
};
