/*
1. sendEvent where fetching from server
2. sendEvent where fetching from cache
3. applyPropositions where propositions passed in
4. applyPropositions where fetching view from cache

Arguments: propositions, renderDecisions, sendNotifications, proposition source (server, cache, or passed in)
*/


// applyPropositions (sendNotifications = false, renderDecision = true)
// -----------------


// sendEvent SPA view change
// ---------------------
// redirectHandler
// measurementSchemaHandler
// domActionHandler
// no-op


// sendEvent with renderDecisions=true
// --------------------
// redirectHandler
// measurementSchemaHandler
// domActionHandler
// cachingHandler
// no-op

// sendEvent with renderDecisions=false
// ---------------------
// cachingHandler
// no-op

import createProposition from "./createProposition";

/**
 * Runs propositions through handlers and generates the return value for the
 * sendEvent call
 *
 * @param {Object} options
 * @param {Array} options.handles - the handles returned from experience edge of
 * type "personalization.decisions"
 * @param {Function} options.handler - the handler function to run on each
 * handle
 * @param {String} options.viewName - the name of the view
 * @param {Function} options.resolveCache - If there is no redirect, this will
 * be called once with the propositions that should be cached. This is resolved
 * with an object with keys equal to the scope/viewName and values equal to an
 * array of propositions.
 * @param {Function} options.resolveDisplayNotification - If there is no
 * redirect, this will be called once with the propositions to include in a
 * display notification.
 * @param {Function} options.resolveRedirectNotification - If there is a
 * redirect, this will be called once with the propositions to include in a
 * redirect notification.
 *
 * @returns {Object} - an object with keys "propositions" and "decisions". This
 * is the return value for the sendEvent call, and is always returned
 * synchronously.
 */
export default ({ window }) => ({
  handles,
  handler,
  viewName,
  resolveDisplayNotification,
  resolveRedirectNotification
 }) => {
  const propositions = handles.map(createProposition);

  for( let i = 0; i < propositions.length; i += 1) {
    const proposition = propositions[i];
    handler({ proposition, viewName });
    const redirectUrl = proposition.getRedirectUrl();
    if (redirectUrl) {
      const displayNotificationPropositions = [];
      proposition.addToNotifications(displayNotificationPropositions);
      // no return value because we are redirecting. i.e. the sendEvent promise will
      // never resolve anyways so no need to generate the return value.
      return resolveRedirectNotification(displayNotificationPropositions).then(() => {
        window.location.replace(redirectUrl);
      }); // TODO add error log message
    }
  };

  Promise.all(propositions.map(proposition => proposition.render())).then(() => {
    const displayNotificationPropositions = [];
    propositions.forEach(proposition => proposition.addToNotifications(displayNotificationPropositions));
    resolveDisplayNotification(displayNotificationPropositions);
  }); // TODO add error log message?

  const returnedPropositions = [];
  const returnedDecisions = [];
  propositions.forEach(p => {
    p.addToReturnedPropositions(returnedPropositions);
    p.addToReturnedDecisions(returnedDecisions);
  });
  return {
    propositions: returnedPropositions,
    decisions: returnedDecisions
  };
}
