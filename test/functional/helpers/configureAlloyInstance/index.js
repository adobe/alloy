import { ClientFunction } from "testcafe";

const configureAlloyInstance = ClientFunction((instanceName, cfg) => {
  let finalInstanceName = instanceName;
  let finalConfig = cfg;

  // Default instanceName to `alloy`.
  if (typeof instanceName === "object" && instanceName !== null) {
    finalInstanceName = "alloy";
    finalConfig = instanceName;
  }

  return window[finalInstanceName]("configure", finalConfig);
});

export default configureAlloyInstance;
