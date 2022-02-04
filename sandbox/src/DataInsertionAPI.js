const trackingServer = "ujsl.sc.omtrdc.net";
const reportSuite = "ujslecommerce";

export function triggerAnalyticsHit({ analyticsPayload, visitorID }) {
  const url = `https://${trackingServer}/b/ss/${reportSuite}/0?g=${window.location}&r=${document.referrer}&vid=${visitorID}&tnta=${analyticsPayload}`;

  return fetch(url)
    .then(success => {
      console.log("success", success);
    })
    .catch(error => {
      console.warn("error while triggering Analytics hit", error);
    });
}
