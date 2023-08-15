export default ({
  actions,
  logger,
  sendEvent,
  window,
  hideContainers,
  showContainers
}) => {
  Object.keys(actions).forEach(key => {
    actions[key].calls.reset();
  });
  logger.warn.calls.reset();
  logger.error.calls.reset();
  sendEvent.calls.reset();
  window.location.replace.calls.reset();
  hideContainers.calls.reset();
  showContainers.calls.reset();
};
