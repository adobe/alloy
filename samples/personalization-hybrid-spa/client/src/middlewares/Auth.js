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
import { generate } from "randomstring";

export const Auth = () => (next) => (action) => {
  let prev = next(action);

  let filterUserData = (data) => {
    let newCart = {};
    let existingGuest = localStorage.getItem("guest");

    if (existingGuest) {
      Object.keys(data).map((key) => {
        if (data[key].guestKey == existingGuest) {
          newCart[key] = data[key];
        }
      });
    } else {
      //create random key for guest
      localStorage.setItem("guest", generate(7));
    }

    return newCart;
  };

  switch (action.type) {
    case "RECEIVE_CART":
      next({ type: "RECEIVE_CART", payload: filterUserData(action.payload) });
      break;
    case "RECEIVE_WL":
      next({ type: "RECEIVE_WL", payload: filterUserData(action.payload) });
      break;
    default:
  }

  return prev;
};
