/* eslint-disable no-unused-vars */

import displayModal from "./actions/displayModal";
import displayBanner from "./actions/displayBanner";

export default collect => {
  // TODO: use collect to capture click and display metrics
  return {
    modal: settings => displayModal(settings, collect),
    banner: settings => displayBanner(settings, collect),
    feed: () => Promise.resolve() // TODO: consider not using in-app-message type here, or leveraging this for some purpose
  };
};
