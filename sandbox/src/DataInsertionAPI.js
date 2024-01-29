const trackingServer = "ujsl.sc.omtrdc.net";
const reportSuite = "ujslecommerce";

export const sendAnalyticsPayload = ({ analyticsPayload, visitorID }) => {
  const url = `https://${trackingServer}/b/ss/${reportSuite}/0?g=${window.location}&r=${document.referrer}&mid=${visitorID}&tnta=${analyticsPayload}`;

  return fetch(url)
    .then(success => {
      // eslint-disable-next-line no-console
      console.log("success", success);
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.warn("error while triggering Analytics hit", error);
    });
};
