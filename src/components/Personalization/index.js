export default () => {
  let core;

  const collect = offerInfo => {
    const tracker = core.components.getByNamespace("Tracker");
    tracker.collect(offerInfo);
  };

  return {
    namespace: "Personalization",
    lifecycle: {
      onComponentsRegistered(_core) {
        core = _core;
      },
      onBeforeViewStart(payload) {
        console.log("Personalization:::onBeforeViewStart");
        payload.appendToQuery({
          personalization: {
            sessionId: "1234235"
          }
        });
      },
      onViewStartResponse({ resources: { personalization = [] } } = {}) {
        console.log("Personalization:::onViewStartResponse");

        document.addEventListener("DOMContentLoaded", () => {
          personalization.forEach(offer => {
            const el = document.querySelector(offer.offerMboxSelector);
            if (el) {
              el.innerHTML = offer.offerHtmlPayload;
              collect({
                event: "offer-rendered",
                ...offer
              });
            }
          });
        });
      }
    }
  };
};
