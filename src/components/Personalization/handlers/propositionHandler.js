// renderDecisions=true
// --------------------
// redirectHandler
// measurementSchemaHandler
// domActionHandler
// cachingHandler
// no-op

// renderDecisions=false
// ---------------------
// cachingHandler
// no-op

import createProposition from "./createProposition";


export default ({ handles, handler, viewName, decisionsDeferred, sendDisplayNotification }) => {
  const propositions = handles.map(createProposition);

  for( let i = 0; i < propositions.length; i += 1) {
    const proposition = propositions[i];
    handler({ proposition, viewName });
    const redirectUrl = proposition.getRedirectUrl();
    if (redirectUrl) {
      const notifications = [];
      proposition.addToNotifications(notifications);
      return sendDisplayNotification(notifications).then(() => {
        window.location.replace(redirectUrl);
      }); // TODO add error log message
    }
  };

  Promise.all(propositions.map(proposition => proposition.render())).then(() => {
    const notificationPropositions = [];
    propositions.forEach(proposition => proposition.addToNotifications(notificationPropositions));
    sendDisplayNotification(notificationPropositions);
  }); // TODO add error log message?

  const cachedPropositions = {};
  const returnedPropositions = [];
  const returnedDecisions = [];
  propositions.forEach(p => {
    p.addToCache(cachedPropositions)
    p.addToReturnedPropositions(returnedPropositions);
    p.addToReturnedDecisions(returnedDecisions);
  });
  decisionsDeferred.resolve(cachedPropositions);
  return {
    propositions: returnedPropositions,
    decisions: returnedDecisions
  };
}
