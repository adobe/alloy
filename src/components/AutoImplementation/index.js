

import createAddEventHandler from "./createAddEventHandler";
import createComponent from "./createComponent";
import createConfigValidators from "./createConfigValidators";
import createSendActionEvent from "./createSendActionEvent";
import createSendPersonalizationEvent from "./createSendPersonalizationEvent";
import createSendStateEvent from "./createSendStateEvent";


const addEventHandler = createAddEventHandler(window);
// TODO: create an applyPropositions lifecycle event or eventManager event so that
// the autoImplementation component can call applyPropositions directly. This will
// break when there are multiple instances or the instance name isn't "alloy".
// OR we could allow metadata passed into sendEvent and through the eventManager.
const applyPropositions = options => {
  window.alloy("applyPropositions", options);
}

const createAutoImplementation = ({ config, eventManager }) => {
  const sendPersonalizationEvent = createSendPersonalizationEvent({ eventManager, applyPropositions });
  const sendStateEvent = createSendStateEvent({ eventManager });
  const sendActionEvent = createSendActionEvent({ eventManager });

  return createComponent({
    config,
    sendPersonalizationEvent,
    sendStateEvent,
    sendActionEvent
  });
}

createAutoImplementation.configValidators = createConfigValidators({ addEventHandler });

export default createAutoImplementation;
