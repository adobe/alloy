export default ({ eventManager }) => ({ xdm } = {}) => {
  // user action call i.e. click event.
  const event = eventManager.createEvent();
  event.setUserXdm(xdm);
  eventManager.sendEvent(event);
};
