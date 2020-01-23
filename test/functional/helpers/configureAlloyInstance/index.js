import { ClientFunction } from "testcafe";

const configureAlloyInstance = ClientFunction((instanceName, cfg) =>
  window[instanceName]("configure", cfg)
);

export default configureAlloyInstance;
