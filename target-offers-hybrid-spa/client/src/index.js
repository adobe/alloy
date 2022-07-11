import React from "react";
import ReactDOM from "react-dom";
import App from "./containers/App";
import About from "./containers/About";
import Cart from "./containers/Cart";
import Wishlist from "./containers/Wishlist";
import Home from "./containers/Home";
import SingleProduct from "./containers/SingleProduct";
import Checkout from "./containers/Checkout";
import Confirm from "./containers/Confirm";
import Products from "./containers/Products";
import { Provider } from "react-redux";
import store from "./store";
import { HashRouter, Route } from "react-router-dom";
import { syncHistoryWithStore } from "react-router-redux";
import { createBrowserHistory } from "history";
import { triggerView } from "./common";

function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16)
  );
}

function createNotification(mbox, type) {
  const id = uuidv4();
  const timestamp = Date.now();
  const { name, state, parameters, profileParameters, order, product } = mbox;
  const result = {
    id,
    type,
    timestamp,
    parameters,
    profileParameters,
    order,
    product,
  };

  result.mbox = { name, state };

  return result;
}

function targetView() {
  var viewName = window.location.hash;

  // Sanitize viewName to get rid of any trailing symbols derived from URL
  if (viewName.startsWith("#")) {
    viewName = viewName.substr(1);
  }
  if (viewName.startsWith("/")) {
    viewName = viewName.substr(1);
  }

  viewName = viewName || "home"; // view name cannot be empty

  triggerView(viewName);
}

const history = syncHistoryWithStore(createBrowserHistory(), store);
history.listen(targetView);

/**
 * Render App
 */
ReactDOM.render(
  <Provider store={store}>
    <HashRouter>
      <App>
        <Route exact path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/cart" component={Cart} />
        <Route path="/wishlist" component={Wishlist} />
        <Route path="/confirm" component={Confirm} />
        <Route path="/products" component={Products} />
        <Route path="/checkout" component={Checkout} />
        <Route
          path="/product/:id"
          component={SingleProduct}
          onEnter={() => store.dispatch({ type: "CLEAR_PRODUCT" })}
        />
      </App>
    </HashRouter>
  </Provider>,
  document.getElementById("app")
);
