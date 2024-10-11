
export default ({ config, sendPersonalizationEvent, sendStateEvent, sendActionEvent }) => {
  const {
    autoImplementation: {
      autoPersonalizationEnabled,
      setupPersonalizationTrigger,
      setupStateTrigger,
      setupActionTrigger
    }
  } = config;

  return {
    namespace: "AutoImplementation",
    lifecycle: {
      onComponentsRegistered() {
        if (autoPersonalizationEnabled) {
          setupPersonalizationTrigger((options) => {
            sendPersonalizationEvent(options).then(() => {
              setupStateTrigger(sendStateEvent);
              setupActionTrigger(sendActionEvent);
            });
          });
        } else {
          setupStateTrigger(sendStateEvent);
          setupActionTrigger(sendActionEvent);
        }
      }
    }
  };
}
