import axios from "../utils/mockAxios.js";
import { fetchWishlist } from "./fetchWishlist";

const requestRemoveFromWishlist = () => {
  return {
    type: "REQUEST_REMOVE_FROM_WL",
  };
};

const receiveRemoveFromWishlist = () => {
  return {
    type: "RECEIVE_REMOVE_FROM_WL",
  };
};

export const removeFromWishlist = (key) => {
  return (dispatch) => {
    dispatch(requestRemoveFromWishlist());
    return axios
      .delete("wishlist", key)
      .then((response) => response)
      .then((json) => {
        dispatch(receiveRemoveFromWishlist(json.data));
        dispatch(fetchWishlist());
      });
  };
};
