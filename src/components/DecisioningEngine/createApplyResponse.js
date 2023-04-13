export default lifecycle => {
  return ({ viewName, propositions = [] }) => {
    if (propositions.length > 0 && lifecycle) {
      lifecycle.onDecision({ viewName, propositions });
    }

    return { propositions };
  };
};
