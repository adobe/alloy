import axios from "../utils/mockAxios.js";

/**
 * Create fetchAbout Action
 */
const requestCart = () => {
  return {
    type: "REQUEST_CART",
  };
};

const receiveCart = (data) => {
  return {
    type: "RECEIVE_CART",
    payload: data === null ? {} : data,
  };
};

export const fetchCart = () => {
  return (dispatch) => {
    dispatch(requestCart());
    return axios
      .get("cart")
      .then((response) => response)
      .then((json) => {
        dispatch(receiveCart(json.data));
      });
  };
};
