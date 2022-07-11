import axios from "axios";

/**
 * Create fetchAbout Action
 */
const requestProduct = () => {
  return {
    type: "REQUEST_PRODUCT",
  };
};

const receiveProduct = (data, id) => {
  return {
    type: "RECEIVE_PRODUCT",
    payload: data,
    id: parseInt(id),
  };
};

export const fetchProduct = (id) => {
  return (dispatch) => {
    dispatch(requestProduct());
    return axios
      .get(`assets/resources/data/products.json`)
      .then((response) => response)
      .then((json) => {
        dispatch(receiveProduct(json.data, id));
      });
  };
};
