import React, { useEffect, useState } from "react";
import { Switch, Route, useRouteMatch, Link } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useAlloy from "./helpers/useAlloy";
import useSendPageViewEvent from "./helpers/useSendPageViewEvent";

const usePropositions = ({ viewName }) => {
  const [propositions, setPropositions] = useState(undefined);
  useSendPageViewEvent({ renderDecisions: true, viewName, setPropositions });

  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions,
      });
    }
  }, [propositions]);
};

const Products = () => {
  usePropositions({ viewName: "products" });
  return (
    <div>
      <h2>Products</h2>
      <div
        style={{ border: "1px solid red" }}
        id="personalization-products-container"
        className="personalization-container"
      >
        This is the personalization placeholder for the products view.
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
        id="personalization-cart-container"
        className="personalization-container"
      >
        This is the personalization placeholder for the cart view. Personalized
        content has not been loaded.
      </div>
    </div>
  );
};
const Promotion = () => {
  usePropositions({ viewName: "promotion" });
  return (
    <div>
      <h2>Cart</h2>
      <div
        style={{ border: "1px solid red" }}
        id="personalization-cart-container"
        className="personalization-container"
      >
        This is the personalization placeholder for the promotion view. We use
        this view to test the use case when nothing was stored in cache.
      </div>
    </div>
  );
};

export default function Personalization() {
  const [isAlloyConfigured, setIsAlloyConfigured] = useState(false);

  useAlloy({
    options: {
      onAlloySetupCompleted: () => {
        setIsAlloyConfigured(true);
      },
    },
  });

  useSendPageViewEvent();

  const match = useRouteMatch();

  return (
    isAlloyConfigured && (
      <div>
        <ContentSecurityPolicy />
        <h1>Personalization - SPA</h1>
        <p>
          Below are links to two different single-page app views. Each view
          contains personalized content set up in Target using a view scope of{" "}
          <i>product</i> and <i>cart</i>, respectively. Each view&apos;s
          personalized content contains a button whose clicks are tracked as
          conversions.
        </p>
        <ul>
          <li>
            <Link to={`${match.url}/products`}>Products</Link>
          </li>
          <li>
            <Link to={`${match.url}/cart`}>Cart</Link>
          </li>
          <li>
            <Link to={`${match.url}/promotion`}>Promotion</Link>
          </li>
        </ul>
        <Switch>
          <Route path={`${match.path}/products`}>
            <Products />
          </Route>
          <Route path={`${match.path}/cart`}>
            <Cart />
          </Route>
          <Route path={`${match.path}/promotion`}>
            <Promotion />
          </Route>
        </Switch>
      </div>
    )
  );
}
