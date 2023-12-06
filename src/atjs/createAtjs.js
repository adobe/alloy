import { noop, noopPromise } from "../utils";
import configure from "./configure";
import getSettings from "./getSettings";
import translateToDeliveryResponse from "./translateToDeliveryResponse";
import translateDeliveryRequest from "./translateDeliveryRequest";

export default win => {
  let alloyInstance;

  const settings = getSettings(win);

  const getOffers = options => {
    return alloyInstance("sendEvent", translateDeliveryRequest(options)).then(
      translateToDeliveryResponse
    );
  };

  const triggerView = viewName => {
    return alloyInstance("sendEvent", {
      renderDecisions: true,
      xdm: {
        web: {
          webPageDetails: {
            viewName
          }
        }
      }
    });
  };

  const pageLoad = () => getOffers({ request: { execute: { pageLoad: {} } } });

  win.adobe = win.adobe || {};
  win.adobe.target = {
    VERSION: "",
    event: {},
    getOffer: noop,
    getOffers,
    applyOffer: noop,
    applyOffers: noopPromise,
    sendNotifications: noop,
    trackEvent: noop,
    triggerView,
    registerExtension: noop,
    init: noop
  };
  win.mboxCreate = noop;
  win.mboxDefine = noop;
  win.mboxUpdate = noop;

  const init = () => {
    const { pageLoadEnabled = true } = settings;

    if (pageLoadEnabled) {
      pageLoad();
    }
  };

  return {
    configure: instanceName => {
      alloyInstance = configure(instanceName, settings);
    },
    init
  };
};
