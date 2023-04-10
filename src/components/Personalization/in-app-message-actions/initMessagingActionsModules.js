/* eslint-disable no-unused-vars */

import displayModal from "./actions/displayModal";
import displayBanner from "./actions/displayBanner";

export default store => {
  return {
    modal: settings => displayModal(settings),
    banner: settings => displayBanner(settings)
  };
};
