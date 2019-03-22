import window from "@adobe/reactor-window";

import getPageInfo from "./getPageInfo";
import getBrowserInfo from "./getBrowserInfo";
import getTopFrameSet from "./getTopFrameSet";
import createComponent from "./createComponent";

let topFrameSet;
const page = () => {
  topFrameSet = topFrameSet || getTopFrameSet(window);

  return getPageInfo(window, topFrameSet);
};

const browser = () => {
  return getBrowserInfo(window);
};

const createContext = ({ config, logger }) => {
  return createComponent(config, logger, { page, browser }, { page, browser });
};

createContext.namespace = "Context";

export default createContext;
