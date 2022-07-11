import axios from "axios";

/**
 * Create fetchAbout Action
 */
const requestProducts = () => {
  return {
    type: "REQUEST_LATEST_PRODUCTS",
  };
};

const receiveProducts = (data) => {
  return {
    type: "RECEIVE_LATEST_PRODUCTS",
    payload: data,
  };
};

export const fetchProducts = () => {
  return (dispatch) => {
    dispatch(requestProducts());

    return axios
      .get(`assets/resources/data/latestProducts.json`)
      .then((json) => {
        dispatch(receiveProducts(json.data));
      });
  };
};
