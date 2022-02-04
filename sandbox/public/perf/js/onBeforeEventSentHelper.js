// code to collect tnta and trigger the Analytics Hit
const trackingServer = "ujsl.sc.omtrdc.net";
const reportSuite = "ujslecommerce";

function triggerAnalyticsHit({ analyticsPayload, visitorID }) {
  const url = `https://${trackingServer}/b/ss/${reportSuite}/0?g=${window.location}&r=${document.referrer}&vid=${visitorID}&tnta=${analyticsPayload}`;

  return fetch(url)
    .then(success => {
      console.log("success", success);
    })
    .catch(error => {
      console.log("error while triggering Analytics hit", error);
    });
}

function getAnalyticsPayload(proposition) {
  const { scopeDetails = {} } = proposition;
  const { characteristics = {} } = scopeDetails;
  const { analyticsToken } = characteristics;

  if (analyticsToken === undefined) {
    return;
  }
  return analyticsToken;
}
const concatinateAnalyticsPayloads = analyticsPayloads => {
  if (analyticsPayloads.size > 1) {
    return [...analyticsPayloads].join(",");
  }
  return [...analyticsPayloads].join();
};

const getECID = (instanceName) => {
  return window[instanceName]("getIdentity", { namespaces: ["ECID"] }).then(result => {
    return result.identity.ECID;
  });
};