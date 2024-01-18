import React, { useEffect, useState } from "react";
import { Heading, View, Link } from "@adobe/react-spectrum";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import useSendPageViewEvent from "./useSendPageViewEvent";

const usePropositions = ({ viewName }) => {
  const [propositions, setPropositions] = useState(undefined);
  useSendPageViewEvent({ viewName, setPropositions });
  useEffect(() => {
    if (propositions) {
      window.alloy("applyPropositions", {
        propositions
      });
    }
  }, [propositions]);
};

const Products = () => {
  usePropositions({ viewName: "products" });
  return (
    <View>
      <Heading level="2">Products</Heading>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        id="personalization-products-container"
        className="personalization-container"
      >
        This is the personalization placeholder for the products view.
        Personalized content has not been loaded.
      </View>
    </View>
  );
};

const Cart = () => {
  usePropositions({ viewName: "cart" });
  return (
    <View>
      <Heading level="2">Cart</Heading>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        id="personalization-cart-container"
        className="personalization-container"
      >
        This is the personalization placeholder for the cart view. Personalized
        content has not been loaded.
      </View>
    </View>
  );
};

const Promotion = () => {
  usePropositions({ viewName: "promotion" });
  return (
    <View>
      <Heading level="2">Promotion</Heading>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        id="personalization-promotion-container"
        className="personalization-container"
      >
        This is the personalization placeholder for the promotion view. We use
        this view to test the use case when nothing was stored in cache.
      </View>
    </View>
  );
};

export default function Personalization() {
  useSendPageViewEvent();
  const match = useRouteMatch();
  return (
    <View>
      <ContentSecurityPolicy />
      <Heading level="1">Personalization - SPA</Heading>
      <p>
        Below are links to two different single-page app views. Each view
        contains personalized content set up in Target using a view scope of{" "}
        <i>product</i> and <i>cart</i>, respectively. Each view's personalized
        content contains a button whose clicks are tracked as conversions.
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
    </View>
  );
}
