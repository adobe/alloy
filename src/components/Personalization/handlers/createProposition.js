export default (handle) => {

  const { id, scope, scopeDetails } = handle;

  let renderers = [];
  let redirectUrl;
  let markedForCache = false;
  let renderAttempted = false;

  return {
    getHandle() {
      return handle;
    },
    redirect(url) {
      renderAttempted = true;
      redirectUrl = url;
    },
    getRedirectUrl() {
      return redirectUrl;
    },
    cache() {
      markedForCache = true;
    },
    addRenderer(renderer) {
      renderAttempted = true;
      renderers.push(renderer);
    },
    render() {
      return Promise.all(renderers.map(renderer => renderer()));
    },
    addToNotifications(notifications) {
      if (renderAttempted) {
        notifications.push({ id, scope, scopeDetails });
      }
    },
    addToCache(cache) {
      if (!markedForCache) {
        return;
      }
      cache[scope] = cache[scope] || [];
      cache[scope].push(handle);
    },
    addToReturnedPropositions(propositions) {
      propositions.push({ ...handle, renderAttempted });
    },
    addToReturnedDecisions(decisions) {
      if (!renderAttempted) {
        decisions.push({ ...handle });
      }
    }
  };

};
