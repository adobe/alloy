import axios from "../utils/mockAxios.js";

/**
 * Create fetchAbout Action
 */
const requestWishlist = () => {
  return {
    type: "REQUEST_WL",
  };
};

const receiveWishlist = (data) => {
  return {
    type: "RECEIVE_WL",
    payload: data === null ? {} : data,
  };
};

export const fetchWishlist = () => {
  return (dispatch) => {
    dispatch(requestWishlist());
    return axios
      .get("wishlist")
      .then((response) => response)
      .then((json) => {
        dispatch(receiveWishlist(json.data));
      });
  };
};
