export default ({ viewCache }) => {
  return ({
    viewName,
    redirectDecisions,
    pageWideScopeDecisions,
    formBasedComposedDecisions
  }) => {
    if (viewName) {
      return viewCache.getView(viewName).then(currentViewDecisions => {
        return {
          decisions: [
            ...redirectDecisions,
            ...pageWideScopeDecisions,
            ...currentViewDecisions,
            ...formBasedComposedDecisions
          ]
        };
      });
    }

    return {
      decisions: [
        ...redirectDecisions,
        ...pageWideScopeDecisions,
        ...formBasedComposedDecisions
      ]
    };
  };
};
