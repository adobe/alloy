import React, { useEffect } from "react";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import {
  getFormBasedOffer,
  personalizationEvent,
} from "./personalizationAnalyticsClientSideHelper";

const Products = () => {
  personalizationEvent({ renderDecisions: true });
  return (
    <div>
      <h2>Products</h2>
      <div
        style={{ border: "1px solid red" }}
        id="personalization-products-container"
      >
        This is the personalization placeholder for the products view.
        Personalized content has not been loaded.
      </div>
    </div>
  );
};

const Cart = () => {
  personalizationEvent({ renderDecisions: true });
  return (
    <div>
      <h2>Cart</h2>
      <div
        style={{ border: "1px solid red" }}
        id="personalization-cart-container"
      >
        This is the personalization placeholder for the cart view. Personalized
        content has not been loaded.
      </div>
    </div>
  );
};

export default function PersonalizationAnalyticsClientSide() {
  useEffect(() => {
    personalizationEvent({ renderDecisions: true });
  }, []);

  const match = useRouteMatch();

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization with A4T client side logging</h1>
      <p>
        This page tests rendering of activities using a <i>__view__</i> scope,
        collecting the analyticsTokens from the rendered propositions and
        trigger a Analytics hit using Data Insertion API. Important!!! If you
        navigated here from another sandbox view, you will probably need to
        refresh your browser because this is how to properly simulate a non-SPA
        workflow.
      </p>
      <div
        style={{ border: "1px solid red" }}
        className="personalization-container"
      >
        This is the personalization placeholder. Personalized content has not
        been loaded.
      </div>
      <div>
        <p>To retrieve a form based composed offer click on this button:</p>
        <button onClick={getFormBasedOffer}>
          Get a4t-test-scope location offer
        </button>

        <div
          style={{ border: "1px solid red", margin: "10px 0 10px 0" }}
          id="form-based-offer-container"
        >
          This is the personalization placeholder for a form based composed
          offer. Personalized content has not been loaded.
        </div>

        <button
          style={{ margin: "10px 0 10px 0" }}
          id="form-based-click-metric"
        >
          {" "}
          Click me!
        </button>
      </div>
      <p> This section is to simulate a SPA use case. </p>
      <ul>
        <li>
          <Link to={`${match.url}/products`}>Products</Link>
        </li>
        <li>
          <Link to={`${match.url}/cart`}>Cart</Link>
        </li>
      </ul>
      <Switch>
        <Route path={`${match.path}/products`}>
          <Products />
        </Route>
        <Route path={`${match.path}/cart`}>
          <Cart />
        </Route>
      </Switch>
    </div>
  );
}
