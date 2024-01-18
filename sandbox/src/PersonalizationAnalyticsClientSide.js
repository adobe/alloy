/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useEffect } from "react";
import { Heading, View, Button } from "@adobe/react-spectrum";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import {
  getFormBasedOffer,
  personalizationEvent
} from "./personalizationAnalyticsClientSideHelper";

const Products = () => {
  personalizationEvent({ renderDecisions: true });
  return (
    <View>
      <Heading level="2">Products</Heading>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        id="personalization-products-container"
      >
        This is the personalization placeholder for the products view.
        Personalized content has not been loaded.
      </View>
    </View>
  );
};

const Cart = () => {
  personalizationEvent({ renderDecisions: true });
  return (
    <View>
      <Heading level="2">Cart</Heading>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        id="personalization-cart-container"
      >
        This is the personalization placeholder for the cart view. Personalized
        content has not been loaded.
      </View>
    </View>
  );
};

export default function PersonalizationAnalyticsClientSide() {
  useEffect(() => {
    personalizationEvent({ renderDecisions: true });
  }, []);

  const match = useRouteMatch();

  return (
    <View>
      <ContentSecurityPolicy />
      <Heading level="1">Personalization with A4T client side logging</Heading>
      <p>
        This page tests rendering of activities using a <i>__view__</i> scope,
        collecting the analyticsTokens from the rendered propositions and
        trigger a Analytics hit using Data Insertion API. Important!!! If you
        navigated here from another sandbox view, you will probably need to
        refresh your browser because this is how to properly simulate a non-SPA
        workflow.
      </p>
      <View
        UNSAFE_style={{ border: "1px solid red" }}
        className="personalization-container"
      >
        This is the personalization placeholder. Personalized content has not
        been loaded.
      </View>
      <View>
        <p>To retrieve a form based composed offer click on this button:</p>
        <Button onPress={getFormBasedOffer}>
          Get a4t-test-scope location offer
        </Button>

        <View
          UNSAFE_style={{ border: "1px solid red", margin: "10px 0 10px 0" }}
          id="form-based-offer-container"
        >
          This is the personalization placeholder for a form based composed
          offer. Personalized content has not been loaded.
        </View>

        <Button
          UNSAFE_style={{ margin: "10px 0 10px 0" }}
          id="form-based-click-metric"
        >
          {" "}
          Click me!
        </Button>
      </View>
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
    </View>
  );
}
