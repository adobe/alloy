import React, { useEffect } from "react";
import ContentSecurityPolicy from "./components/ContentSecurityPolicy";
import { Link, Route, Switch, useRouteMatch } from "react-router-dom";
import { triggerAnalyticsHit } from "./DataInsertionAPI";
import {
  getECID,
  concatinateAnalyticsPayloads,
  collectAnalyticsPayloadData,
  getAnalyticsToken
} from "./analyticsTokenHandler";
// offer types
const HTML_SCHEMA = "https://ns.adobe.com/personalization/html-content-item";
const MEASUREMENT_SCHEMA = "https://ns.adobe.com/personalization/measurement";

const instanceName = "organizationTwo";

const getFormBasedOffer = () => {
  sendEvent({
    eventType: "form-based-offer",
    decisionScopes: ["a4t-test"]
  }).then(result => {
    if (!result.propositions) {
      return;
    }
    const analyticsPayloads = new Set();
    const executedPropositions = [];

    result.propositions.forEach(proposition => {
      proposition.items.forEach(item => {
        if (item.schema === HTML_SCHEMA) {
          // apply offer
          document.getElementById("form-based-offer-container").innerHTML =
            item.data.content;

          //collect the executed proposition to send the display notification event
          executedPropositions.push({
            id: proposition.id,
            scope: proposition.scope,
            scopeDetails: proposition.scopeDetails
          });

          analyticsPayloads.add(getAnalyticsToken(proposition));
        }

        if (item.schema === MEASUREMENT_SCHEMA) {
          // add metric to the DOM element
          const button = document.getElementById("form-based-click-metric");

          button.addEventListener("click", event => {
            sendEvent({
              eventType: "decisioning.propositionInteract",
              executedPropositions: [
                {
                  id: proposition.id,
                  scope: proposition.scope,
                  scopeDetails: proposition.scopeDetails
                }
              ]
            });
          });
        }
      });
    });

    sendEvent({
      eventType: "decisioning.propositionDisplay",
      executedPropositions
    });

    getECID(instanceName).then(visitorID => {
      const analyticsPayload = concatinateAnalyticsPayloads(analyticsPayloads);
      triggerAnalyticsHit({ analyticsPayload, visitorID });
    });
  });
};

const sendEvent = ({
  eventType,
  viewName,
  decisionScopes,
  renderDecisions,
  executedPropositions
}) => {
  const xdm = {
    eventType: eventType
  };

  if (viewName) {
    xdm.web = {
      webPageDetails: {
        viewName
      }
    };
  }

  if (executedPropositions) {
    xdm._experience = {
      decisioning: {
        propositions: executedPropositions
      }
    };
  }

  return window[instanceName]("sendEvent", {
    renderDecisions,
    decisionScopes,
    xdm
  });
};

const Products = () => {
  sendEvent({
    eventType: "view-change",
    viewName: "products",
    renderDecisions: true
  }).then(result => {
    if (!result.propositions) {
      return;
    }
    const analyticsPayload = collectAnalyticsPayloadData(result.propositions);
    getECID(instanceName).then(visitorID => {
      triggerAnalyticsHit({ analyticsPayload, visitorID });
    });
  });
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
  sendEvent({
    eventType: "view-change",
    viewName: "cart",
    renderDecisions: true
  }).then(result => {
    if (!result.propositions) {
      return;
    }
    const analyticsPayload = collectAnalyticsPayloadData(result.propositions);
    getECID(instanceName).then(visitorID => {
      triggerAnalyticsHit({ analyticsPayload, visitorID });
    });
  });

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
    const xdm = {};
    xdm.eventType = "page-view";

    window[instanceName]("sendEvent", {
      renderDecisions: true,
      xdm
    }).then(result => {
      if (!result.propositions) {
        return;
      }

      const analyticsPayload = collectAnalyticsPayloadData(result.propositions);
      getECID(instanceName).then(visitorID => {
        triggerAnalyticsHit({ analyticsPayload, visitorID });
      });
    });
  }, []);

  const match = useRouteMatch();

  return (
    <div>
      <ContentSecurityPolicy />
      <h1>Personalization with A4T client side logging</h1>
      <p>
        This page tests rendering of activities using a <i>__view__</i> scope.
        If you navigated here from another sandbox view, you will probably need
        to refresh your browser because this is how to properly simulate a
        non-SPA workflow.
      </p>
      <div style={{ border: "1px solid red" }} id="personalization-container">
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
