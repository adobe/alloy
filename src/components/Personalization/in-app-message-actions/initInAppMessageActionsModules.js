/* eslint-disable no-unused-vars */

import displayIframeContent from "./actions/displayIframeContent";

export default collect => {
  return {
    defaultContent: settings => displayIframeContent(settings, collect)
  };
};
