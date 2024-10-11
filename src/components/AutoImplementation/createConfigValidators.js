import { objectOf, callback } from "../../utils/validation";
import { COMPLETE, HASHCHANGE } from "./createAddEventHandler";

export default ({ addEventHandler }) => {

  const defaultSetupTopOfPageTrigger = (trigger) =>
    trigger();
  const defaultSetupBottomOfPageTrigger = (trigger) =>
    addEventHandler(COMPLETE, trigger);
  const defaultSetupViewChangeTrigger = (trigger) =>
    addEventHandler(HASHCHANGE, (event) => {
      const viewName = new URL(event.newURL).hash;
      trigger({ viewName });
    });

  return objectOf({
    autoImplementation: objectOf({
      setupTopOfPageTrigger: callback().default(defaultSetupTopOfPageTrigger),
      setupBottomOfPageTrigger: callback().default(defaultSetupBottomOfPageTrigger),
      setupViewChangeTrigger: callback().default(defaultSetupViewChangeTrigger)
    }).default({
      setupTopOfPageTrigger: defaultSetupTopOfPageTrigger,
      setupBottomOfPageTrigger: defaultSetupBottomOfPageTrigger,
      setupViewChangeTrigger: defaultSetupViewChangeTrigger
    })
  });
};
