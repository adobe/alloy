import {
  collectAnalyticsPayloadData,
  concatenateAnalyticsPayloads,
  getDisplayAnalyticsToken,
  getECID,
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

const sendEvent = ({
  eventType,
  viewName,
  decisionScopes,
  renderDecisions,
  executedPropositions,
}) => {
  const xdm = {
    eventType,
  };

  if (viewName) {
    xdm.web = {
      webPageDetails: {
        viewName,
      },
    };
  }

  if (executedPropositions) {
    // eslint-disable-next-line no-underscore-dangle
    xdm._experience = {
      decisioning: {
        propositions: executedPropositions,
      },
    };
  }

  return window[instanceName]("sendEvent", {
    renderDecisions,
    decisionScopes, // Note: this option will soon be deprecated, please use personalization.decisionScopes instead
    xdm,
  });
};

export const personalizationEvent = ({ renderDecisions }) => {
  const viewName = extractViewName();
  const eventType = viewName ? "view-change" : "page-view";
  sendEvent({ eventType, viewName, renderDecisions }).then((result) => {
    if (!result.propositions) {
      return;
    }

    const analyticsPayload = collectAnalyticsPayloadData(result.propositions);
    getECID(instanceName).then((visitorID) => {
      sendAnalyticsPayload({ analyticsPayload, visitorID });
    });
  });
};

export const getFormBasedOffer = () => {
  sendEvent({
    eventType: "form-based-offer",
    decisionScopes: ["a4t-test"], // Note: this option will soon be deprecated, please use personalization.decisionScopes instead
  }).then((result) => {
    if (!result.propositions) {
      return;
    }
    const analyticsPayloads = new Set();
    const executedPropositions = [];

    result.propositions.forEach((proposition) => {
      proposition.items.forEach((item) => {
        if (item.schema === HTML_SCHEMA) {
          // apply offer
          document.getElementById("form-based-offer-container").innerHTML =
            item.data.content;

          // collect the executed proposition to send the display notification event
          executedPropositions.push({
            id: proposition.id,
            scope: proposition.scope,
            scopeDetails: proposition.scopeDetails,
          });

          analyticsPayloads.add(getDisplayAnalyticsToken(proposition));
        }

        if (item.schema === MEASUREMENT_SCHEMA) {
          // add metric to the DOM element
          const button = document.getElementById("form-based-click-metric");

          button.addEventListener("click", () => {
            sendEvent({
              eventType: "decisioning.propositionInteract",
              executedPropositions: [
                {
                  id: proposition.id,
                  scope: proposition.scope,
                  scopeDetails: proposition.scopeDetails,
                },
              ],
              instanceName,
            });
          });
        }
      });
    });

    sendEvent({
      eventType: "decisioning.propositionDisplay",
      executedPropositions,
      instanceName,
    });

    getECID(instanceName).then((visitorID) => {
      const analyticsPayload = concatenateAnalyticsPayloads(analyticsPayloads);
      sendAnalyticsPayload({ analyticsPayload, visitorID });
    });
  });
};
