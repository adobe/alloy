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
