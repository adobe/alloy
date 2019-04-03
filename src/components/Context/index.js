import webFactory from "./webFactory";
import environmentFactory from "./environmentFactory";
import deviceFactory from "./deviceFactory";
import topFrameSetFactory from "./topFrameSetFactory";
import createComponent from "./createComponent";

const topFrameSetProvider = topFrameSetFactory(window);
const web = webFactory(window, topFrameSetProvider);
const environment = environmentFactory(window, () => new Date());
const device = deviceFactory(window);

const createContext = ({ config, logger }) => {
  return createComponent(
    config,
    logger,
    { web, device, environment },
    { web, device, environment }
  );
};

createContext.namespace = "Context";

export default createContext;
