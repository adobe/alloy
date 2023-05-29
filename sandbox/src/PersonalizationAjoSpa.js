import React, { useEffect, useState } from "react";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const Products = () => {
  usePropositions({ viewName: "products" });
  return (
    <div>
      <h2>Products</h2>
      <div
        style={{ border: "1px solid red" }}
        id="personalization-products-container-ajo"
        className="personalization-container"
      >
        This is the AJO personalization placeholder for the products view.
        Personalized content has not been loaded.
      </div>
    </div>
  );
};

const Cart = () => {
  usePropositions({ viewName: "cart" });
  return (
    <div>
      <h2>Cart</h2>
      <div
        style={{ border: "1px solid red" }}
        id="personalization-cart-container-ajo"
        className="personalization-container"
      >
        This is the AJO personalization placeholder for the cart view.
        Personalized content has not been loaded.
      </div>
    </div>
  );
};

const usePropositions = ({ viewName }) => {
  const [propositions, setPropositions] = useState(undefined);
  useSendPageViewEvent({ viewName, setPropositions });
  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions
      });
    }
  });
};

export default function PersonalizationAjoSpa() {
  useSendPageViewEvent({ instanceName: "cjmProd" });

  const match = useRouteMatch();

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization - AJO - SPA</h1>
      <p>
        Below are links to two different single-page app views. Each view
        contains personalized content set up in AJO using a view scope of{" "}
        <i>product</i> and <i>cart</i>, respectively.
      </p>
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
