import addRenderToExecutedDecisions from "./utils/addRenderToExecutedDecisions";

export default ({
  viewCache,
  executeDecisions,
  executeCachedViewDecisions,
  showContainers
}) => {
  return ({ viewName, pageWideScopeDecisions, formBasedComposedDecisions }) => {
    if (viewName) {
      return viewCache.getView(viewName).then(currentViewDecisions => {
        executeDecisions(pageWideScopeDecisions);
        executeCachedViewDecisions({
          viewName,
          viewDecisions: currentViewDecisions
        });
        showContainers();

        return {
          decisions: [...formBasedComposedDecisions],
          propositions: [
            ...addRenderToExecutedDecisions(pageWideScopeDecisions),
            ...addRenderToExecutedDecisions(currentViewDecisions),
            ...formBasedComposedDecisions
          ]
        };
      });
    }

    executeDecisions(pageWideScopeDecisions);
    showContainers();

    return {
      decisions: [...formBasedComposedDecisions],
      propositions: [
        ...addRenderToExecutedDecisions(pageWideScopeDecisions),
        ...formBasedComposedDecisions
      ]
    };
  };
};
