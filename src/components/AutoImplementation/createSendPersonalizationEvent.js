import { defer } from "../../utils";

export default ({ eventManager, applyPropositions }) => ({ xdm, metadata = {} } = {}) => {
  // Top of page call
  // returns a promise that resolves when it is safe to send the bottom of page event
  const deferred = defer();
  const event = eventManager.createEvent();
  event.setUserXdm(xdm);
  event.mergeXdm({ eventType: "decisioning.propositionFetch" });
  eventManager.sendEvent(event, {
    renderDecisions: true,
    personalization: {
      decisionScopes: Object.keys(metadata),
      sendDisplayEvent: false
    }
  }).then(({ propositions }) => {
    if (Object.keys(metadata).length) {
      applyPropositions({ propositions, metadata });
    }
    deferred.resolve();
  });
  if (Object.keys(metadata).length === 0) {
    deferred.resolve();
  }

  return deferred.promise;
};

