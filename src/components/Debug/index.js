import { boolean, objectOf } from "../../utils/validation/index.js";

const optionsValidator = objectOf({
  enabled: boolean().required(),
}).noUnknownFields();

export default ({ addMonitor, getDebugEnabled, setDebugEnabled, logger }) => {
  const component = ({ config, instanceName }) => {
    let { debugEnabled: debugEnabledConfig } = config;
    let debugEnabled = debugEnabledConfig || !!getDebugEnabled(instanceName);
    const monitor = {
      onBeforeLog({ level, arguments: args }) {
        if (debugEnabled) {
          logger[level](...args);
        }
      },
    };
    addMonitor(monitor);

    return {
      commands: {
        setDebug: {
          optionsValidator,
          run: ({ enabled }) => {
            debugEnabled = enabled;
            setDebugEnabled(instanceName, enabled);
          },
        },
      },
    };
  };

  component.namespace = "Debug";
  component.configValidators = objectOf({
    debugEnabled: boolean().default(false),
  });

  return component;
};
