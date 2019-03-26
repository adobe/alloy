import getWeb from "./getWeb";
import getEnvironment from "./getEnvironment";
import getDevice from "./getDevice";
import getTopFrameSet from "./getTopFrameSet";
import createComponent from "./createComponent";

let topFrameSet;
const web = () => {
  topFrameSet = topFrameSet || getTopFrameSet(window);

  return getWeb(window, topFrameSet, new Date());
};

const environment = () => {
  return getEnvironment(window);
};

const device = () => {
  return getDevice(window, document);
};

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
