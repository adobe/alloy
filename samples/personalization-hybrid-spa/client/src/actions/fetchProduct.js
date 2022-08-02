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
