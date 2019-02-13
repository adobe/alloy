export default () => {
  let core;

  const collect = offerInfo => {
    const tracker = core.components.getComponent("Tracker");
    tracker.collect(offerInfo);
  };

  return {
    namespace: "Personalization",
    onComponentsRegistered(_core) {
      core = _core;
    },
    onBeforeInteract(payload) {
      console.log("Personalization:::onBeforeInteract");
      payload.appendToQuery({
        personalization: {
          sessionId: "1234235"
        }
      });
    },
    onInteractResponse({ resources: { personalization = [] } } = {}) {
      console.log("Personalization:::onInteractResponse");

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
  };
};
