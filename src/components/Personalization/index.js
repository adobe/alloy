export default function Personalization() {
  let core;
  const self = this;

  Object.defineProperty(this, "namespace", {
    get() {
      return "Personalization";
    }
  });

  // IMPLEMENT THE HOOKS YOU ARE INTERESTED IN.

  this.onComponentsRegistered = coreInstance => {
    core = coreInstance;
  };

  this.onBeforeInteract = payload => {
    console.log("Personalization:::onBeforeInteract");
    payload.appendToQuery({
      personalization: {
        sessionId: "1234235"
      }
    });
  };

  this.collect = offerInfo => {
    const tracker = core.components.getComponent("Tracker");
    tracker.collect(offerInfo);
  };

  this.onInteractResponse = ({ resources: { personalization = [] } } = {}) => {
    console.log("Personalization:::onInteractResponse");

    document.addEventListener("DOMContentLoaded", function() {
      personalization.forEach(offer => {
        const el = document.querySelector(offer.offerMboxSelector);
        if (el) {
          el.innerHTML = offer.offerHtmlPayload;
          self.collect({
            event: "offer-rendered",
            ...offer
          });
        }
      });
    });
  };
}
