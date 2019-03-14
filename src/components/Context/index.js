import page from "./page";
import browser from "./browser";

// TODO: replace this with the real logger
const logger = console;

export const createContextComponent = (availableContexts, defaultContexts) => {
  let configuredContexts = {};

  const onBeforeRequest = payload => {
    const context = Object.keys(configuredContexts).reduce((memo, key) => {
      memo[key] = configuredContexts[key](); // eslint-disable-line no-param-reassign
      return memo;
    }, {});
    payload.addContext(context);
  };

  return {
    namespace: "Context",
    lifecycle: {
      onComponentsRegistered(core) {
        if (!core.configs.context) {
          logger.debug(`
            No configured context.  Using default context.
          `);
          configuredContexts = defaultContexts;
          return;
        }
        if (!Array.isArray(core.configs.context)) {
          logger.warn(`
            Invalid configured context.  Please specify an array of strings.
          `);
          configuredContexts = {};
          return;
        }

        configuredContexts = core.configs.context.reduce((memo, context) => {
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

export default () => {
  return createContextComponent({ page, browser }, { page, browser });
};
