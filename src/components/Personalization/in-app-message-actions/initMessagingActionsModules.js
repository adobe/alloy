/* eslint-disable no-unused-vars */

import displayModal from "./actions/displayModal";
import displayBanner from "./actions/displayBanner";
import displayCustom from "./actions/displayCustom";
import displayFullScreen from "./actions/displayFullScreen";

export const IAM_ACTION_TYPE_MODAL = "modal";
export const IAM_ACTION_TYPE_BANNER = "banner";
export const IAM_ACTION_TYPE_FULLSCREEN = "fullscreen";
export const IAM_ACTION_TYPE_CUSTOM = "custom";

export default collect => {
  // TODO: use collect to capture click and display metrics
  return {
    [IAM_ACTION_TYPE_MODAL]: settings => displayModal(settings, collect),
    [IAM_ACTION_TYPE_BANNER]: settings => displayBanner(settings, collect),
    [IAM_ACTION_TYPE_FULLSCREEN]: settings =>
      displayFullScreen(settings, collect),
    [IAM_ACTION_TYPE_CUSTOM]: settings => displayCustom(settings, collect)
  };
};
