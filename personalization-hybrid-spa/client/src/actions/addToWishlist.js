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
