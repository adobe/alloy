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
