import axios from "../utils/mockAxios.js";
import { fetchWishlist } from "./fetchWishlist";
import { fireActionTriggerCustomEvent } from "../utils/customEvents";

/**
 * Create fetchAbout Action
 */
const requestAddToWishlist = () => {
  return {
    type: "REQUEST_ADD_TO_WL",
  };
};

const receiveAddToWishlist = (data) => {
  return {
    type: "RECEIVE_ADD_TO_WL",
    payload: data,
  };
};

const checkUserOrGuest = (productId) => {
  if (localStorage.getItem("guest")) {
    return { id: productId, guestKey: localStorage.getItem("guest") };
  }
};

export const addToWishlist = (productId, target) => {
  fireActionTriggerCustomEvent(target, {
    detail: {
      linkName: target.getAttribute("data-link-name"),
      action: target.getAttribute("data-track-action"),
    },
  });
  return (dispatch) => {
    dispatch(requestAddToWishlist());
    return axios
      .post("wishlist", checkUserOrGuest(productId))
      .then((response) => response)
      .then((json) => {
        dispatch(receiveAddToWishlist(json.data));
        dispatch(fetchWishlist());
      });
  };
};
