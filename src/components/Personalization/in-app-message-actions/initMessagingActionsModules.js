/* eslint-disable no-unused-vars */

import displayModal from "./actions/displayModal";
import displayBanner from "./actions/displayBanner";
import noop from "../../../utils/noop";

export default store => {
  return {
    modal: settings => displayModal(settings),
    banner: settings => displayBanner(settings),
    feed: () => Promise.resolve() // TODO: consider not using in-app-message type here, or leveraging this for some purpose
  };
};
