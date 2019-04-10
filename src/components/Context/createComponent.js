export default (config, logger, availableContexts, defaultContexts) => {
  let configuredContexts = {};
  const onBeforeRequest = payload => {
    const context = Object.keys(configuredContexts).reduce((memo, key) => {
      memo = { ...memo, ...configuredContexts[key]() }; // eslint-disable-line no-param-reassign
      return memo;
    }, {});
    payload.addContext(context);
  };
  return {
    namespace: "Context",
    lifecycle: {
      onComponentsRegistered() {
        if (!config.context) {
          logger.log(`No configured context.  Using default context.`);
          configuredContexts = defaultContexts;
          return;
        }
        if (!Array.isArray(config.context)) {
          logger.warn(
            `Invalid configured context.  Please specify an array of strings.`
          );
          configuredContexts = {};
          return;
        }
        configuredContexts = config.context.reduce((memo, context) => {
          if (availableContexts[context]) {
            memo[context] = availableContexts[context]; // eslint-disable-line no-param-reassign
          } else {
            logger.warn(`Configured context ${context} is not available.`);
          }
          return memo;
        }, {});
      },
      onBeforeEvent: onBeforeRequest,
      onBeforeViewStart: onBeforeRequest
    }
  };
};
