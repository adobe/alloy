import { objectOf, callback } from "../../utils/validation";
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
      setupPersonalizationTrigger: callback().default(defaultSetupPersonalizationTrigger),
      setupStateTrigger: callback().default(defaultSetupStateTrigger),
      setupActionTrigger: callback().default(defaultSetupActionTrigger)
    }).default({
      setupPersonalizationTrigger: defaultSetupPersonalizationTrigger,
      setupStateTrigger: defaultSetupStateTrigger,
      setupActionTrigger: defaultSetupActionTrigger
    })
  });
};
