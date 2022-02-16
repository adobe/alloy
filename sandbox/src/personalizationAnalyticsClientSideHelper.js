import {
  collectAnalyticsPayloadData,
  concatenateAnalyticsPayloads,
  getAnalyticsToken,
  getECID
} from "./analyticsTokenHandler";
import { sendAnalyticsPayload } from "./DataInsertionAPI";

// this org is configured to have Analytics disabled thus it is A4T Client Side Logging
const instanceName = "organizationTwo";

// offer types
const HTML_SCHEMA = "https://ns.adobe.com/personalization/html-content-item";
const MEASUREMENT_SCHEMA = "https://ns.adobe.com/personalization/measurement";

const extractViewName = () => {
  const pathname = window.location.pathname;
  const viewName = pathname.split("personalizationA4TClientSide/");

  return viewName[1];
};

export const personalizationEvent = ({ renderDecisions }) => {
  const viewName = extractViewName();
  const eventType = viewName ? "view-change" : "page-view";
  sendEvent({ eventType, viewName, renderDecisions }).then(result => {
    if (!result.propositions) {
      return;
    }

    const analyticsPayload = collectAnalyticsPayloadData(result.propositions);
    getECID(instanceName).then(visitorID => {
      sendAnalyticsPayload({ analyticsPayload, visitorID });
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

export const getFormBasedOffer = () => {
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
              ],
              instanceName
            });
          });
        }
      });
    });

    sendEvent({
      eventType: "decisioning.propositionDisplay",
      executedPropositions,
      instanceName
    });

    getECID(instanceName).then(visitorID => {
      const analyticsPayload = concatenateAnalyticsPayloads(analyticsPayloads);
      sendAnalyticsPayload({ analyticsPayload, visitorID });
    });
  });
};
