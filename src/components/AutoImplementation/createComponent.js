
const sendPersonalizationEvent = (eventManager, { xdm } = {}) => {
  // Top of page call
  const event = eventManager.createEvent();
  event.setUserXdm(xdm);
  event.mergeXdm({ eventType: "decisioning.propositionFetch" });
  eventManager.sendEvent(event, {
    renderDecisions: true,
    personalization: {
      sendDisplayEvent: false
    }
  })
};

const sendStateEvent = (eventManager, { xdm } = {}) => {
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

const sendActionEvent = (eventManager, { xdm } = {}) => {
  // user action call i.e. click event.
  const event = eventManager.createEvent();
  event.setUserXdm(xdm);
  eventManager.sendEvent(event);
}


export default () => ({ eventManager, config }) => {
  const {
    autoImplementation: {
      setupPersonalizationTrigger,
      setupStateTrigger,
      setupActionTrigger
    }
  } = config;

  return {
    namespace: "AutoImplementation",
    lifecycle: {
      onComponentsRegistered() {
        setupPersonalizationTrigger((options) => {
          sendPersonalizationEvent(eventManager, options);
          setupStateTrigger((options) => {
            sendStateEvent(eventManager, options);
          });
          setupActionTrigger((options) => {
            sendActionEvent(eventManager, options);
          });
        });
      }
    }
  };
}
