export default ({ eventManager }) => ({ xdm } = {}) => {
  // Bottom of page call or hash change call
  const event = eventManager.createEvent();
  event.setUserXdm(xdm);
  eventManager.sendEvent(event, {
    renderDecisions: true,
    personalization: {
      includeRenderedPropositions: true
    }
  });
}
