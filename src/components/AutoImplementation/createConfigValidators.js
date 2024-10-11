import { objectOf, callback, boolean } from "../../utils/validation";
import { COMPLETE, HASHCHANGE } from "./createAddEventHandler";

export default ({ addEventHandler }) => {

  const defaultSetupPersonalizationTrigger = (trigger) =>
    trigger();
  const defaultSetupStateTrigger = (trigger) => {
    addEventHandler(COMPLETE, trigger);
    addEventHandler(HASHCHANGE, (event) => {
      const viewName = new URL(event.newURL).hash;
      trigger({ xdm: { web: { webPageDetails: { viewName } } } });
    });
  };
  const defaultSetupActionTrigger = () => undefined;

  return objectOf({
    autoImplementation: objectOf({
      autoPersonalizationEnabled: boolean().default(true),
      setupPersonalizationTrigger: callback().default(defaultSetupPersonalizationTrigger),
      setupStateTrigger: callback().default(defaultSetupStateTrigger),
      setupActionTrigger: callback().default(defaultSetupActionTrigger)
    }).default({
      autoPersonalizationEnabled: true,
      setupPersonalizationTrigger: defaultSetupPersonalizationTrigger,
      setupStateTrigger: defaultSetupStateTrigger,
      setupActionTrigger: defaultSetupActionTrigger
    })
  });
};
