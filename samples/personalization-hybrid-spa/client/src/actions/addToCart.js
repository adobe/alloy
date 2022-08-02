/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import axios from "../utils/mockAxios.js";
import { fireActionTriggerCustomEvent } from "../utils/customEvents";

import { fetchCart } from "./fetchCart";

/**
 * Create fetchAbout Action
 */
const requestAddToCart = () => {
  return {
    type: "REQUEST_ADD_TO_CART",
  };
};

const receiveAddToCart = (data) => {
  return {
    type: "RECEIVE_ADD_TO_CART",
    payload: data,
  };
};

const checkUserOrGuest = (productId) => {
  if (localStorage.getItem("guest")) {
    return { id: productId, guestKey: localStorage.getItem("guest") };
  }
};

export const addToCart = (productId, target) => {
  fireActionTriggerCustomEvent(target, {
    detail: {
      linkName: target.getAttribute("data-link-name"),
      action: target.getAttribute("data-track-action"),
    },
  });
  return (dispatch) => {
    dispatch(requestAddToCart());
    return axios
      .post("cart", checkUserOrGuest(productId))
      .then((response) => response)
      .then((json) => {
        dispatch(receiveAddToCart(json.data));
        dispatch(fetchCart());
      });
  };
};
