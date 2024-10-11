
const sendTopEvent = (eventManager, { xdm } = {}) => {
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

const sendBottomEvent = (eventManager, { xdm } = {}) => {
  // Bottom of page call
  const event = eventManager.createEvent();
  event.setUserXdm(xdm);
  eventManager.sendEvent(event, {
    personalization: {
      includeRenderedPropositions: true
    }
  });
}

const sendViewChangeEvent = (eventManager, { viewName }) => {
  // Hash change call
  const event = eventManager.createEvent();
  event.mergeXdm({
    web: {
      webPageDetails: {
        viewName
      }
    }
  });
  eventManager.sendEvent(event, {
    renderDecisions: true,
  })
}


export default () => ({ eventManager, config }) => {
  const {
    autoImplementation: {
      setupTopOfPageTrigger,
      setupBottomOfPageTrigger,
      setupViewChangeTrigger
    }
  } = config;

  return {
    namespace: "AutoImplementation",
    lifecycle: {
      onComponentsRegistered() {
        setupTopOfPageTrigger((options) => {
          sendTopEvent(eventManager, options);
          setupBottomOfPageTrigger((options) => {
            sendBottomEvent(eventManager, options);
          });
          setupViewChangeTrigger((options) => {
            sendViewChangeEvent(eventManager, options);
          });
        });
      }
    }
  };
}
