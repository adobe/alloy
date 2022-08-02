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
