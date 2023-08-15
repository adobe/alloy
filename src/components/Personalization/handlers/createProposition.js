export default (handle) => {

  const { id, scope, scopeDetails, items = [] } = handle;

  let renderers = [];
  let redirectUrl;
  let includeInDisplayNotification = false;
  let itemsRenderAttempted = new Array(items.length).map(() => false);

  return {
    getHandle() {
      return handle;
    },
    getMeta() {
      return { id, scope, scopeDetails };
    },
    redirect(url) {
      includeInDisplayNotification = true;
      redirectUrl = url;
    },
    getRedirectUrl() {
      return redirectUrl;
    },
    addRenderer(itemIndex, renderer) {
      itemsRenderAttempted[itemIndex] = true;
      renderers.push(renderer);
    },
    includeInDisplayNotification() {
      includeInDisplayNotification = true;
    },
    render() {
      return Promise.all(renderers.map(renderer => renderer()));
    },
    addToNotifications(notifications) {
      if (includeInDisplayNotification) {
        notifications.push({ id, scope, scopeDetails });
      }
    },
    addToReturnedPropositions(propositions) {
      const renderedItems = items.filter((item, index) => itemsRenderAttempted[index]);
      if (renderedItems.length > 0) {
        propositions.push({ ...handle, items: renderedItems, renderAttempted: true });
      }
      const nonrenderedItems = items.filter((item, index) => !itemsRenderAttempted[index]);
      if (nonrenderedItems.length > 0) {
        propositions.push({ ...handle, items: nonrenderedItems, renderAttempted: false });
      }
    },
    addToReturnedDecisions(decisions) {
      const nonrenderedItems = items.filter((item, index) => !itemsRenderAttempted[index]);
      if (nonrenderedItems.length > 0) {
        decisions.push({ ...handle, items: nonrenderedItems });
      }
    }
  };

};
