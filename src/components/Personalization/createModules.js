import { DOM_ACTION, IN_APP_MESSAGE } from "./constants/schema";
import { initDomActionsModules } from "./dom-actions";
import initMessagingActionsModules from "./in-app-message-actions/initMessagingActionsModules";

export default storeClickMetrics => {
  return {
    [DOM_ACTION]: initDomActionsModules(storeClickMetrics),
    [IN_APP_MESSAGE]: initMessagingActionsModules(storeClickMetrics)
  };
};
